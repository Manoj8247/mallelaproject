from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv 
import os

load_dotenv()

app = Flask(__name__)
CORS(app)


# ==========================================
# DATABASE CONFIGURATION
# ==========================================

DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": os.getenv("DB_PASSWORD"),
    "database": "mmk_store",
    "connection_timeout": 10
}


# ==========================================
# CREATE DATABASE CONNECTION
# ==========================================

def get_db_connection():

    try:
        connection = mysql.connector.connect(**DB_CONFIG)

        if connection.is_connected():
            print("MySQL connection created successfully!")

        return connection

    except Error as e:

        print("MySQL connection error:", e)
        return None


# ==========================================
# TEST BACKEND
# ==========================================

@app.route("/api/test")
def test():

    connection = get_db_connection()

    if connection is None:
        return jsonify({
            "success": False,
            "message": "Unable to connect to MySQL"
        }), 500

    connection.close()

    return jsonify({
        "success": True,
        "message": "MMK backend and database are working!"
    }), 200


# ==========================================
# REGISTER CUSTOMER
# ==========================================

@app.route("/api/register", methods=["POST"])
def register():

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "Invalid request data."
        }), 400

    full_name = data.get("full_name")
    email = data.get("email")
    phone = data.get("phone")
    password = data.get("password")
    address = data.get("address")

    if not full_name or not email or not phone or not password or not address:

        return jsonify({
            "success": False,
            "message": "All fields are required."
        }), 400

    connection = get_db_connection()

    if connection is None:

        return jsonify({
            "success": False,
            "message": "Unable to connect to database."
        }), 500

    cursor = connection.cursor()

    try:

        # Check existing email

        cursor.execute(
            """
            SELECT customer_id
            FROM customers
            WHERE email = %s
            """,
            (email,)
        )

        existing_customer = cursor.fetchone()

        if existing_customer:

            return jsonify({
                "success": False,
                "message": "Email already registered."
            }), 409

        # Hash password

        password_hash = generate_password_hash(password)

        # Insert customer

        cursor.execute(
            """
            INSERT INTO customers
            (full_name, email, phone, password_hash, address)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (
                full_name,
                email,
                phone,
                password_hash,
                address
            )
        )

        connection.commit()

        return jsonify({
            "success": True,
            "message": "Registration successful!"
        }), 201

    except Error as e:

        connection.rollback()

        print("Registration error:", e)

        return jsonify({
            "success": False,
            "message": "Registration failed."
        }), 500

    finally:

        cursor.close()
        connection.close()


# ==========================================
# LOGIN CUSTOMER
# ==========================================

@app.route("/api/login", methods=["POST"])
def login():

    data = request.get_json()

    if not data:

        return jsonify({
            "success": False,
            "message": "Invalid request data."
        }), 400

    email = data.get("email")
    password = data.get("password")

    if not email or not password:

        return jsonify({
            "success": False,
            "message": "Email and password are required."
        }), 400

    connection = get_db_connection()

    if connection is None:

        return jsonify({
            "success": False,
            "message": "Unable to connect to database."
        }), 500

    cursor = connection.cursor(
        dictionary=True,
        buffered=True
    )

    try:

        cursor.execute(
            """
            SELECT *
            FROM customers
            WHERE email = %s
            """,
            (email,)
        )

        customer = cursor.fetchone()

        if customer is None:

            return jsonify({
                "success": False,
                "message": "Invalid email or password."
            }), 401

        if not check_password_hash(
            customer["password_hash"],
            password
        ):

            return jsonify({
                "success": False,
                "message": "Invalid email or password."
            }), 401

        return jsonify({
            "success": True,
            "message": "Login successful",
            "customer": {
                "customer_id": customer["customer_id"],
                "full_name": customer["full_name"],
                "email": customer["email"],
                "phone": customer["phone"],
                "address": customer["address"]
            }
        }), 200

    except Error as e:

        print("Login error:", e)

        return jsonify({
            "success": False,
            "message": "Login failed."
        }), 500

    finally:

        cursor.close()
        connection.close()


# ==========================================
# GET ALL PRODUCTS
# ==========================================

@app.route("/api/products", methods=["GET"])
def get_products():

    connection = get_db_connection()

    if connection is None:

        return jsonify({
            "success": False,
            "message": "Unable to connect to database."
        }), 500

    cursor = connection.cursor(
        dictionary=True,
        buffered=True
    )

    try:

        cursor.execute(
            """
            SELECT
                product_id,
                product_name,
                description,
                price,
                stock_quantity,
                image_url,
                created_at
            FROM products
            """
        )

        products = cursor.fetchall()

        return jsonify({
            "success": True,
            "products": products
        }), 200

    except Error as e:

        print("Product error:", e)

        return jsonify({
            "success": False,
            "message": "Failed to get products."
        }), 500

    finally:

        cursor.close()
        connection.close()


# ==========================================
# CREATE ORDER
# ==========================================

@app.route("/api/orders", methods=["POST"])
def create_order():

    data = request.get_json()

    if not data:

        return jsonify({
            "success": False,
            "message": "Invalid request data."
        }), 400

    customer_id = data.get("customer_id")
    delivery_address = data.get("delivery_address")
    items = data.get("items")

    if not customer_id or not delivery_address or not items:

        return jsonify({
            "success": False,
            "message": "Customer ID, delivery address and items are required."
        }), 400

    connection = get_db_connection()

    if connection is None:

        return jsonify({
            "success": False,
            "message": "Unable to connect to database."
        }), 500

    cursor = connection.cursor(
        dictionary=True,
        buffered=True
    )

    try:

        # ----------------------------------
        # Check customer
        # ----------------------------------

        cursor.execute(
            """
            SELECT customer_id
            FROM customers
            WHERE customer_id = %s
            """,
            (customer_id,)
        )

        customer = cursor.fetchone()

        if customer is None:

            return jsonify({
                "success": False,
                "message": "Customer not found."
            }), 404

        subtotal = 0
        order_items = []

        # ----------------------------------
        # Check products
        # ----------------------------------

        for item in items:

            product_name = item.get("name")
            quantity = item.get("quantity")

            if (
                not product_name
                or quantity is None
                or float(quantity) <= 0
            ):

                return jsonify({
                    "success": False,
                    "message": "Invalid product or quantity."
                }), 400

            cursor.execute(
                """
                SELECT
                    product_id,
                    product_name,
                    price
                FROM products
                WHERE product_name = %s
                """,
                (product_name,)
            )

            product = cursor.fetchone()

            if product is None:

                return jsonify({
                    "success": False,
                    "message": f"Product not found: {product_name}"
                }), 404

            quantity = float(quantity)
            price = float(product["price"])

            item_total = price * quantity

            subtotal += item_total

            order_items.append({
                "product_id": product["product_id"],
                "quantity": quantity,
                "price": price
            })

        # ----------------------------------
        # Delivery charge
        # ----------------------------------

        if subtotal < 200:
            delivery_charge = 30
        else:
            delivery_charge = 0

        total_amount = subtotal + delivery_charge

        # ----------------------------------
        # Create order
        # ----------------------------------

        cursor.execute(
            """
            INSERT INTO orders
            (
                customer_id,
                total_amount,
                delivery_address,
                order_status
            )
            VALUES (%s, %s, %s, %s)
            """,
            (
                customer_id,
                total_amount,
                delivery_address,
                "Pending"
            )
        )

        order_id = cursor.lastrowid

        # ----------------------------------
        # Insert order items
        # ----------------------------------

        for item in order_items:

            cursor.execute(
                """
                INSERT INTO order_items
                (
                    order_id,
                    product_id,
                    quantity,
                    price
                )
                VALUES (%s, %s, %s, %s)
                """,
                (
                    order_id,
                    item["product_id"],
                    item["quantity"],
                    item["price"]
                )
            )

        connection.commit()

        return jsonify({
            "success": True,
            "message": "Order placed successfully.",
            "order_id": order_id,
            "subtotal": round(subtotal, 2),
            "delivery": delivery_charge,
            "total_amount": round(total_amount, 2)
        }), 201

    except Error as e:

        connection.rollback()

        print("Order creation error:", e)

        return jsonify({
            "success": False,
            "message": "Failed to place order."
        }), 500

    finally:

        cursor.close()
        connection.close()


# ==========================================
# GET CUSTOMER ORDERS
# ==========================================

@app.route("/api/orders/<int:customer_id>", methods=["GET"])
def get_customer_orders(customer_id):

    connection = get_db_connection()

    if connection is None:

        return jsonify({
            "success": False,
            "message": "Unable to connect to database."
        }), 500

    cursor = connection.cursor(
        dictionary=True,
        buffered=True
    )

    try:

        cursor.execute(
            """
            SELECT
                o.order_id,
                o.total_amount,
                o.delivery_address,
                o.order_status,
                o.created_at
            FROM orders o
            WHERE o.customer_id = %s
            ORDER BY o.order_id DESC
            """,
            (customer_id,)
        )

        orders = cursor.fetchall()

        return jsonify({
            "success": True,
            "orders": orders
        }), 200

    except Error as e:

        print("Error getting orders:", e)

        return jsonify({
            "success": False,
            "message": "Failed to get orders."
        }), 500

    finally:

        cursor.close()
        connection.close()


# ==========================================
# CANCEL CUSTOMER ORDER
# ==========================================

@app.route(
    "/api/orders/<int:order_id>/cancel",
    methods=["POST"]
)
def cancel_order(order_id):

    data = request.get_json()

    if not data:

        return jsonify({
            "success": False,
            "message": "Invalid request data."
        }), 400

    customer_id = data.get("customer_id")

    if not customer_id:

        return jsonify({
            "success": False,
            "message": "Customer ID is required."
        }), 400

    connection = get_db_connection()

    if connection is None:

        return jsonify({
            "success": False,
            "message": "Unable to connect to database."
        }), 500

    cursor = connection.cursor(
        dictionary=True,
        buffered=True
    )

    try:

        # ----------------------------------
        # Check order belongs to customer
        # ----------------------------------

        cursor.execute(
            """
            SELECT
                order_id,
                customer_id,
                order_status
            FROM orders
            WHERE order_id = %s
              AND customer_id = %s
            """,
            (
                order_id,
                customer_id
            )
        )

        order = cursor.fetchone()

        if not order:

            return jsonify({
                "success": False,
                "message": "Order not found."
            }), 404

        # ----------------------------------
        # Only Pending orders can be cancelled
        # ----------------------------------

        if order["order_status"] != "Pending":

            return jsonify({
                "success": False,
                "message": "This order cannot be cancelled."
            }), 400

        # ----------------------------------
        # Cancel order
        # ----------------------------------

        cursor.execute(
            """
            UPDATE orders
            SET order_status = 'Cancelled'
            WHERE order_id = %s
              AND customer_id = %s
            """,
            (
                order_id,
                customer_id
            )
        )

        connection.commit()

        return jsonify({
            "success": True,
            "message": "Order cancelled successfully."
        }), 200

    except Error as e:

        connection.rollback()

        print("Cancel order error:", e)

        return jsonify({
            "success": False,
            "message": "Failed to cancel order."
        }), 500

    finally:

        cursor.close()
        connection.close()

#==========================================
# CONTACT MESSAGE
#=========================================
@app.route("/api/contact", methods=["POST"])
def contact_message():
    data = request.get_json()

    name = data.get("name")
    email = data.get("email")
    message = data.get("message")

    if not name or not email or not message:
        return jsonify({
            "success": False,
            "message": "All fields are required."
        }), 400

    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        cursor.execute(
            """
            INSERT INTO contact_messages
            (name, email, message)
            VALUES (%s, %s, %s)
            """,
            (name, email, message)
        )

        connection.commit()

        return jsonify({
            "success": True,
            "message": "Your message has been sent successfully."
        }), 201

    except Exception as e:
        connection.rollback()
        print("Contact message error:", e)

        return jsonify({
            "success": False,
            "message": "Failed to send your message."
        }), 500

    finally:
        cursor.close()
        connection.close()

    #=========================================
    # CREATE REVIEW
    #=========================================
@app.route("/api/reviews", methods=["POST"])
def create_review():
    data = request.get_json()

    customer_id = data.get("customer_id")
    rating = data.get("rating")
    review_text = data.get("review_text")

    if not customer_id or not rating or not review_text:
        return jsonify({
            "success": False,
            "message": "Customer ID, rating and review are required."
        }), 400

    if int(rating) < 1 or int(rating) > 5:
        return jsonify({
            "success": False,
            "message": "Rating must be between 1 and 5."
        }), 400

    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        cursor.execute(
            "SELECT customer_id FROM customers WHERE customer_id = %s",
            (customer_id,)
        )

        customer = cursor.fetchone()

        if customer is None:
            return jsonify({
                "success": False,
                "message": "Customer not found."
            }), 404

        cursor.execute(
            """
            INSERT INTO reviews
            (customer_id, rating, review_text)
            VALUES (%s, %s, %s)
            """,
            (customer_id, rating, review_text)
        )

        connection.commit()

        return jsonify({
            "success": True,
            "message": "Review submitted successfully."
        }), 201

    except Exception as e:
        connection.rollback()
        print("Review error:", e)

        return jsonify({
            "success": False,
            "message": "Failed to submit review."
        }), 500

    finally:
        cursor.close()
        connection.close()

        # ======================================================
# GET ALL REVIEWS
# ======================================================

@app.route("/api/reviews", methods=["GET"])
def get_reviews():

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:

        cursor.execute("""
            SELECT
                r.review_id,
                r.customer_id,
                c.full_name,
                r.rating,
                r.review_text,
                r.created_at
            FROM reviews r
            JOIN customers c
                ON r.customer_id = c.customer_id
            ORDER BY r.created_at DESC
        """)

        reviews = cursor.fetchall()

        return jsonify({
            "success": True,
            "reviews": reviews
        }), 200

    except Exception as e:

        print("Review loading error:", e)

        return jsonify({
            "success": False,
            "message": "Failed to load reviews."
        }), 500

    finally:

        cursor.close()
        connection.close()

# ==========================================
# START FLASK
# ==========================================

if __name__ == "__main__":

    app.run(debug=True)