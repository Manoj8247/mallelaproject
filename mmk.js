// ======================================================
// MALLELA MILKS - JAVASCRIPT
// ======================================================


// ======================================================
// 1. SMOOTH SCROLLING
// ======================================================

document.querySelectorAll('a[href^="#"]').forEach(function (link) {

    link.addEventListener("click", function (event) {

        const targetId = this.getAttribute("href");

        if (targetId === "#") {
            event.preventDefault();
            return;
        }

        const target = document.querySelector(targetId);

        if (target) {
            event.preventDefault();

            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    });

});


// ======================================================
// 2. CUSTOMER RATING - STAR SYSTEM
// ======================================================

const ratingStars = document.querySelectorAll(".rating-stars span");

let selectedRating = 0;

ratingStars.forEach(function (star) {

    star.addEventListener("click", function () {

        selectedRating = Number(this.dataset.rating);

        ratingStars.forEach(function (item) {

            const rating = Number(item.dataset.rating);

            if (rating <= selectedRating) {
                item.textContent = "★";
                item.style.color = "#f5b301";
            } else {
                item.textContent = "☆";
                item.style.color = "#777";
            }

        });

    });

});


// ======================================================
// 3. FEEDBACK FORM
// ======================================================

const feedbackForm = document.querySelector(".feedback-form form");

if (feedbackForm) {

    feedbackForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const nameInput = feedbackForm.querySelector(
            'input[type="text"]'
        );

        const emailInput = feedbackForm.querySelector(
            'input[type="email"]'
        );

        const feedbackInput = feedbackForm.querySelector(
            "textarea"
        );


        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const feedback = feedbackInput.value.trim();

        // Get logged-in customer ID
        const customerId = localStorage.getItem("customerId");


        // Check login
        if (!customerId) {

            alert("Please login before submitting a review.");

            return;
        }


        // Check name
        if (name === "") {

            alert("Please enter your name.");

            nameInput.focus();

            return;
        }


        // Check email
        if (email === "") {

            alert("Please enter your email.");

            emailInput.focus();

            return;
        }


        // Check rating
        if (selectedRating === 0) {

            alert("Please select your rating.");

            return;
        }


        // Check feedback
        if (feedback === "") {

            alert("Please write your feedback.");

            feedbackInput.focus();

            return;
        }


        // Review data sent to Flask
        const reviewData = {

            customer_id: Number(customerId),

            rating: selectedRating,

            review_text: feedback

        };


        // Send review to backend
        fetch("http://127.0.0.1:5000/api/reviews", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(reviewData)

        })

            .then(function (response) {

                return response.json();

            })

            .then(function (data) {

                if (!data.success) {

                    alert(
                        data.message ||
                        "Failed to submit review."
                    );

                    return;
                }


                // Show review on webpage
                addReview(
                    name,
                    selectedRating,
                    feedback
                );


                alert("Thank you for your feedback!");


                // Clear form
                feedbackForm.reset();


                // Reset stars
                selectedRating = 0;

                ratingStars.forEach(function (star) {

                    star.textContent = "☆";

                    star.style.color = "#777";

                });

            })

            .catch(function (error) {

                console.error(
                    "Review error:",
                    error
                );

                alert(
                    "Unable to submit review. Please check whether the backend is running."
                );

            });

    });

}


// ======================================================
// 4. ADD NEW REVIEW TO PAGE
// ======================================================

function addReview(name, rating, feedback) {

    const reviewContainer =
        document.querySelector(".review-container");

    if (!reviewContainer) {
        return;
    }


    // Create review card
    const reviewCard =
        document.createElement("div");

    reviewCard.className = "review-card";


    // Create stars
    let stars = "";

    for (let i = 1; i <= 5; i++) {

        if (i <= rating) {
            stars += "★";
        } else {
            stars += "☆";
        }

    }


    reviewCard.innerHTML = `

        <div class="stars" style="color:#f5b301;">
            ${stars}
        </div>

        <p>
            "${feedback}"
        </p>

        <h3>
            ${name}
        </h3>

        <span>
            Customer
        </span>

    `;


    reviewContainer.appendChild(reviewCard);
}


// ======================================================
// 5. SAVE REVIEWS IN BROWSER
// ======================================================

function saveReview(name, email, rating, feedback) {

    let reviews =
        JSON.parse(
            localStorage.getItem("mallelaReviews")
        ) || [];


    const review = {

        name: name,

        email: email,

        rating: rating,

        feedback: feedback,

        date: new Date().toISOString()

    };


    reviews.push(review);


    localStorage.setItem(
        "mallelaReviews",
        JSON.stringify(reviews)
    );

}


// ======================================================
// 6. LOAD REVIEWS FROM DATABASE
// ======================================================

let allReviews = [];
let visibleReviews = 6;

function loadReviews() {

    fetch("http://127.0.0.1:5000/api/reviews")
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {

            if (!data.success) {
                console.error("Failed to load reviews.");
                return;
            }

            allReviews = data.reviews;

            displayReviews();

        })
        .catch(function (error) {

            console.error(
                "Review loading error:",
                error
            );

        });
}


// ======================================================
// DISPLAY REVIEWS
// ======================================================

function displayReviews() {

    const reviewContainer =
        document.querySelector("#review-container");

    const viewMoreButton =
        document.querySelector("#view-more-reviews");

    if (!reviewContainer) {
        return;
    }

    reviewContainer.innerHTML = "";

    const reviewsToShow =
        allReviews.slice(0, visibleReviews);

    reviewsToShow.forEach(function (review) {

        addReview(
            review.full_name,
            review.rating,
            review.review_text
        );

    });


    // Show View More only when more reviews exist

    if (viewMoreButton) {

        if (allReviews.length > visibleReviews) {

            viewMoreButton.style.display = "block";

        } else {

            viewMoreButton.style.display = "none";

        }
    }
}


// ======================================================
// VIEW MORE REVIEWS
// ======================================================

const viewMoreButton =
    document.querySelector("#view-more-reviews");

if (viewMoreButton) {

    viewMoreButton.addEventListener("click", function () {

        visibleReviews += 6;

        displayReviews();

    });

}


loadReviews();





// ======================================================
// 8. REGISTRATION FORM
// ======================================================

const registerForm =
    document.querySelector(".register-form");


if (registerForm) {

    registerForm.addEventListener("submit", function (event) {

        event.preventDefault();


        const fullName =
            document.querySelector("#full-name");

        const phone =
            document.querySelector("#phone");

        const email =
            document.querySelector("#email");

        const address =
            document.querySelector("#address");

        const password =
            document.querySelector("#register-password");


        // Full name
        if (fullName.value.trim() === "") {

            alert("Please enter your full name.");

            fullName.focus();

            return;
        }


        // Phone
        if (phone.value.trim() === "") {

            alert("Please enter your phone number.");

            phone.focus();

            return;
        }


        // Phone validation
        const phonePattern = /^[0-9]{10}$/;

        if (!phonePattern.test(phone.value.trim())) {

            alert("Please enter a valid 10-digit phone number.");

            phone.focus();

            return;
        }


        // Email
        if (email.value.trim() === "") {

            alert("Please enter your email.");

            email.focus();

            return;
        }


        // Address
        if (address.value.trim() === "") {

            alert("Please enter your delivery address.");

            address.focus();

            return;
        }


        // Password
        if (password.value.length < 6) {

            alert(
                "Password must contain at least 6 characters."
            );

            password.focus();

            return;
        }


        fetch("http://127.0.0.1:5000/api/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                full_name: fullName.value.trim(),
                email: email.value.trim(),
                phone: phone.value.trim(),
                password: password.value,
                address: address.value.trim()
            })
        })
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {

                if (data.success) {

                    alert("Registration successful!");

                    registerForm.reset();

                } else {

                    alert(data.message);

                }

            })
            .catch(function (error) {

                console.error(error);

                alert("Unable to connect to the backend.");

            });

    });

}


// ======================================================
// 9. CONTACT FORM
// ======================================================


const contactForm = document.querySelector(".contact-form form");

if (contactForm) {
    contactForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const name = contactForm.querySelector('input[type="text"]').value.trim();
        const email = contactForm.querySelector('input[type="email"]').value.trim();
        const message = contactForm.querySelector("textarea").value.trim();

        if (name === "" || email === "" || message === "") {
            alert("Please fill in all fields.");
            return;
        }

        fetch("http://127.0.0.1:5000/api/contact", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: name,
                email: email,
                message: message
            })
        })
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                if (data.success) {
                    alert("Your message has been sent successfully!");
                    contactForm.reset();
                } else {
                    alert(data.message || "Failed to send your message.");
                }
            })
            .catch(function (error) {
                console.error("Contact form error:", error);
                alert("Unable to send your message. Please check whether the backend is running.");
            });
    });
}


// ======================================================
// 11. KNOW MORE BUTTON
// ======================================================

const knowMoreButton =
    document.querySelector(".about-content .primary-btn");


if (knowMoreButton) {

    knowMoreButton.addEventListener("click", function (event) {

        event.preventDefault();

        const products =
            document.querySelector("#products");

        if (products) {

            products.scrollIntoView({
                behavior: "smooth"
            });

        }

    });

}


// ======================================================
// 12. PAGE LOAD MESSAGE
// ======================================================

console.log(
    "Mallela Milks website JavaScript loaded successfully."
);

// Your existing JavaScript code
// ...


// =====================================================
// MALLELA MILKS SHOPPING SYSTEM
// =====================================================

let currentProduct = {
    name: "",
    price: 0,
    image: ""
};

let currentQuantity = 0.5;

let shoppingCart = [];


// =====================================================
// OPEN PRODUCT
// =====================================================

function openProduct(name, price, image) {

    if (localStorage.getItem("isLoggedIn") !== "true") {

        alert("Please login first.");

        const loginSection = document.getElementById("login");

        if (loginSection) {
            loginSection.scrollIntoView({
                behavior: "smooth"
            });
        }

        return;
    }

    currentProduct.name = name;
    currentProduct.price = Number(price);
    currentProduct.image = image;

    currentQuantity = 0.5;

    document.getElementById("product-popup").style.display = "flex";

    document.getElementById("popup-product-name").textContent =
        currentProduct.name;

    document.getElementById("popup-product-image").src =
        currentProduct.image;

    document.getElementById("popup-product-price").textContent =
        "₹" + currentProduct.price;

    document.getElementById("quantity").textContent =
        currentQuantity;

    updateProductTotal();
}


// =====================================================
// CLOSE PRODUCT
// =====================================================

function closeProduct() {

    document.getElementById("product-popup").style.display = "none";
}

// =====================================================
// PRODUCT POPUP QUANTITY
// =====================================================

function increaseQuantity() {

    currentQuantity += 0.5;

    currentQuantity =
        Number(currentQuantity.toFixed(2));

    document.getElementById("quantity").textContent =
        currentQuantity;

    updateProductTotal();
}


function decreaseQuantity() {

    if (currentQuantity <= 0.5) {
        return;
    }

    currentQuantity -= 0.5;

    currentQuantity =
        Number(currentQuantity.toFixed(2));

    document.getElementById("quantity").textContent =
        currentQuantity;

    updateProductTotal();
}


// =====================================================
// UPDATE PRODUCT TOTAL
// =====================================================

function updateProductTotal() {

    const total =
        currentProduct.price * currentQuantity;

    document.getElementById("total-price").textContent =
        total.toFixed(2);
}


// =====================================================
// ADD CURRENT PRODUCT TO CART
// =====================================================

function addCurrentProductToCart() {

    const existingProduct =
        shoppingCart.find(function (item) {

            return item.name === currentProduct.name;

        });


    if (existingProduct) {

        existingProduct.quantity += currentQuantity;

        existingProduct.quantity =
            Number(existingProduct.quantity.toFixed(2));

    } else {

        shoppingCart.push({

            name: currentProduct.name,

            price: currentProduct.price,

            quantity: currentQuantity,

            image: currentProduct.image

        });

    }


    updateShoppingCart();

    closeProduct();


    document.getElementById("shopping").style.display = "block";

    document.getElementById("shopping").scrollIntoView({
        behavior: "smooth"
    });


    alert(
        currentProduct.name +
        " added to your cart."
    );
}


// =====================================================
// INCREASE CART QUANTITY
// =====================================================

function increaseCartQuantity(index) {

    if (!shoppingCart[index]) {
        return;
    }

    shoppingCart[index].quantity += 0.5;

    shoppingCart[index].quantity =
        Number(
            shoppingCart[index].quantity.toFixed(2)
        );

    updateShoppingCart();
}


// =====================================================
// DECREASE CART QUANTITY
// =====================================================

function decreaseCartQuantity(index) {

    if (!shoppingCart[index]) {
        return;
    }

    if (shoppingCart[index].quantity <= 0.5) {
        return;
    }

    shoppingCart[index].quantity -= 0.5;

    shoppingCart[index].quantity =
        Number(
            shoppingCart[index].quantity.toFixed(2)
        );

    updateShoppingCart();
}

window.increaseCartQuantity = increaseCartQuantity;
window.decreaseCartQuantity = decreaseCartQuantity;

// =====================================================
// UPDATE SHOPPING CART
// =====================================================

function updateShoppingCart() {

    const cartContainer =
        document.getElementById("cart-items");

    if (!cartContainer) {
        return;
    }

    let subtotal = 0;


    if (shoppingCart.length === 0) {

        cartContainer.innerHTML =
            '<p class="empty-cart">Your cart is empty.</p>';

        document.getElementById("subtotal").textContent = "0.00";

        document.getElementById("delivery").textContent = "0.00";

        document.getElementById("grand-total").textContent = "0.00";

        return;
    }


    cartContainer.innerHTML = "";


    shoppingCart.forEach(function (item, index) {

        const itemTotal =
            item.price * item.quantity;

        subtotal += itemTotal;


        const cartItem =
            document.createElement("div");

        cartItem.className = "cart-item";


        cartItem.innerHTML = `

            <div class="cart-product">

                <img
                    src="${item.image}"
                    alt="${item.name}"
                    class="cart-product-image"
                >

                <div>

                    <h3>
                        ${item.name}
                    </h3>

                    <p>
                        Price: ₹${item.price}
                    </p>

                    <div class="quantity-control">

                        <button
                            type="button"
                            onclick="window.decreaseCartQuantity(${index})"
                        >
                            −
                        </button>

                        <span>
                            ${item.quantity} kg
                        </span>

                        <button
                            type="button"
                            onclick="window.increaseCartQuantity(${index})"
                        >
                            +
                        </button>

                    </div>

                    <strong>
                        ₹${itemTotal.toFixed(2)}
                    </strong>

                </div>

            </div>

            <button
                type="button"
                class="remove-btn"
                onclick="window.removeCartItem(${index})"
            >
                Remove
            </button>

        `;


        cartContainer.appendChild(cartItem);

    });


    // =================================================
    // DELIVERY
    // =================================================

    let delivery = 0;

    if (subtotal > 0 && subtotal < 200) {
        delivery = 30;
    }

    if (subtotal >= 200) {
        delivery = 0;
    }


    const grandTotal =
        subtotal + delivery;


    document.getElementById("subtotal").textContent =
        subtotal.toFixed(2);

    document.getElementById("delivery").textContent =
        delivery.toFixed(2);

    document.getElementById("grand-total").textContent =
        grandTotal.toFixed(2);
}


// =====================================================
// REMOVE CART ITEM
// =====================================================

function removeCartItem(index) {

    shoppingCart.splice(index, 1);

    updateShoppingCart();

    if (shoppingCart.length === 0) {

        document.getElementById("checkout").style.display =
            "none";
    }
}

// =====================================================
// GO TO CHECKOUT
// =====================================================

function goToCheckout() {

    if (shoppingCart.length === 0) {

        alert("Please add a product to your cart first.");

        return;

    }

    document.getElementById("checkout").style.display = "block";

    document.getElementById("checkout").scrollIntoView({
        behavior: "smooth"
    });

}


// =====================================================
// PLACE ORDER
// =====================================================

function placeOrder(event) {

    event.preventDefault();

    // Check cart
    if (shoppingCart.length === 0) {
        alert("Your cart is empty.");
        return;
    }

    // Get customer details
    const name = document.getElementById("customer-name").value.trim();
    const phone = document.getElementById("customer-phone").value.trim();
    const address = document.getElementById("customer-address").value.trim();

    // Check name
    if (name === "") {
        alert("Please enter your name.");
        return;
    }

    // Check phone
    const phonePattern = /^[0-9]{10}$/;

    if (!phonePattern.test(phone)) {
        alert("Please enter a valid 10-digit phone number.");
        return;
    }

    // Check address
    if (address === "") {
        alert("Please enter your delivery address.");
        return;
    }

    // Get logged-in customer ID
    const customerId = localStorage.getItem("customerId");

    if (!customerId) {
        alert("Please login first.");
        return;
    }

    // Prepare order data
    const orderData = {
        customer_id: Number(customerId),
        delivery_address: address,
        items: shoppingCart.map(function (item) {
            return {
                name: item.name,
                quantity: item.quantity
            };
        })
    };

    // Send order to Flask backend
    fetch("http://127.0.0.1:5000/api/orders", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(orderData)
    })

        .then(function (response) {
            return response.json();
        })

        .then(function (data) {

            if (!data.success) {
                alert(data.message || "Failed to place order.");
                return;
            }

            // Create display order ID
            const displayOrderId =
                "MMK" + String(data.order_id).padStart(6, "0");

            // Show order ID
            document.getElementById("order-id").textContent =
                displayOrderId;

            // Hide checkout
            document.getElementById("checkout").style.display = "none";

            // Show success section
            document.getElementById("order-success").style.display = "block";

            // Clear cart
            shoppingCart = [];

            updateShoppingCart();

            // Clear form
            document.getElementById("order-form").reset();

            console.log("Order saved successfully:", data);
        })

        .catch(function (error) {

            console.error("Order error:", error);

            alert(
                "Unable to place order. Please check whether the backend is running."
            );
        });
}

function startNewOrder() {
    document.getElementById("order-success").style.display = "none";
    document.getElementById("checkout").style.display = "block";
}
// =====================================================
// login form submission
// =====================================================
function loginUser(event) {

    event.preventDefault();

    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;

    fetch("http://127.0.0.1:5000/api/login", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            email: email,
            password: password
        })

    })

        .then(response => response.json())

        .then(data => {

            if (data.success) {
                localStorage.setItem("isLoggedIn", "true");
                localStorage.setItem("customerName", data.customer.full_name);
                localStorage.setItem("customerId", data.customer.customer_id);
                updateLoginStatus();

                alert("Login successful!");


                window.location.href = "mmk.html#products";

            } else {

                alert(data.message);

            }

        })

        .catch(error => {

            console.error("Login error:", error);

            alert("Unable to connect to the server.");

        });
}

// ================= LOGIN STATUS =================

function updateLoginStatus() {
    const loginBtn = document.getElementById("login-btn");
    const registerBtn = document.getElementById("register-btn");
    const userWelcome = document.getElementById("user-welcome");
    const logoutBtn = document.getElementById("logout-btn");

    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const customerName = localStorage.getItem("customerName");

    if (isLoggedIn === "true") {
        loginBtn.style.display = "none";
        registerBtn.style.display = "none";

        userWelcome.textContent = "Welcome, " + customerName;
        userWelcome.style.display = "inline";

        logoutBtn.style.display = "inline";
    } else {
        loginBtn.style.display = "inline";
        registerBtn.style.display = "inline";

        userWelcome.style.display = "none";
        logoutBtn.style.display = "none";
    }
}

document.addEventListener("DOMContentLoaded", function () {
    updateLoginStatus();

    const logoutBtn = document.getElementById("logout-btn");

    logoutBtn.addEventListener("click", function (event) {
        event.preventDefault();

        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("customerName");

        updateLoginStatus();

        window.location.href = "mmk.html#login";
    });
});
function updateLoginStatus() {
    const customerName = localStorage.getItem("customerName");

    const loginBtn = document.getElementById("login-btn");
    const registerBtn = document.getElementById("register-btn");
    const welcome = document.getElementById("user-welcome");
    const logoutBtn = document.getElementById("logout-btn");

    if (customerName) {
        loginBtn.style.display = "none";
        registerBtn.style.display = "none";

        welcome.textContent = "Welcome, " + customerName;
        welcome.style.display = "inline";

        logoutBtn.style.display = "inline";
    } else {
        loginBtn.style.display = "inline";
        registerBtn.style.display = "inline";

        welcome.style.display = "none";
        logoutBtn.style.display = "none";
    }
}

document.addEventListener("DOMContentLoaded", function () {

    updateLoginStatus();

    const logoutBtn = document.getElementById("logout-btn");

    if (logoutBtn) {

        logoutBtn.addEventListener("click", function (event) {

            event.preventDefault();

            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("customerName");

            updateLoginStatus();

            window.location.hash = "home";

        });

    }

});

// =====================================================
// LOAD PRODUCTS FROM BACKEND
// =====================================================

function loadProducts() {

    fetch("http://127.0.0.1:5000/api/products")

        .then(function (response) {
            return response.json();
        })

        .then(function (data) {

            if (!data.success) {
                alert("Unable to load products.");
                return;
            }

            const productContainer =
                document.getElementById("product-container");

            productContainer.innerHTML = "";

            data.products.forEach(function (product) {

                const productCard =
                    document.createElement("div");

                productCard.className = "product-card";

                productCard.innerHTML = `

                    <div class="product-image">

                        <img
                            src="${product.image_url}"
                            alt="${product.product_name}"
                        >

                    </div>

                    <div class="product-content">

                        <h3>
                            ${product.product_name}
                        </h3>

                        <p>
                            ${product.description}
                        </p>

                        <p class="price">
                            ₹${product.price}
                        </p>

                        <button
                            class="product-btn"
                            onclick="openProduct(
                                '${product.product_name}',
                                ${product.price},
                                '${product.image_url}'
                            )"
                        >
                            View Product
                        </button>

                    </div>

                `;

                productContainer.appendChild(productCard);

            });

        })

        .catch(function (error) {

            console.error(
                "Product loading error:",
                error
            );

            alert("Unable to connect to the backend.");

        });

}


// Load products when page opens
loadProducts();

// =====================================================
// CREATE ORDER CARD
// =====================================================

function createOrderCard(order, container) {

    const orderCard = document.createElement("div");

    orderCard.className = "order-card";

    const displayOrderId =
        "MMK" +
        String(order.order_id).padStart(6, "0");

    let cancelButton = "";

    // Cancel button only for Pending orders
    if (order.order_status === "Pending") {

        cancelButton = `
            <button
                type="button"
                class="cancel-order-btn"
                onclick="cancelOrder(${order.order_id})"
            >
                Cancel Order
            </button>
        `;
    }

    orderCard.innerHTML = `

        <h3>
            Order ID: ${displayOrderId}
        </h3>

        <p>
            <strong>Date:</strong>
            ${order.created_at}
        </p>

        <p>
            <strong>Total:</strong>
            ₹${order.total_amount}
        </p>

        <p>
            <strong>Delivery Address:</strong>
            ${order.delivery_address}
        </p>

        <p>
            <strong>Status:</strong>
            ${order.order_status}
        </p>

        ${cancelButton}

    `;

    container.appendChild(orderCard);
}

// =====================================================
// LOAD MY ORDERS
// =====================================================

function loadMyOrders() {

    const customerId =
        localStorage.getItem("customerId");

    const ordersContainer =
        document.getElementById("my-orders-container");

    if (!ordersContainer) {
        return;
    }

    // Customer is not logged in
    if (!customerId) {

        ordersContainer.innerHTML =
            "<p>Please login to view your orders.</p>";

        return;
    }

    fetch(
        "http://127.0.0.1:5000/api/orders/" + customerId
    )

        .then(function (response) {
            return response.json();
        })

        .then(function (data) {

            if (!data.success) {

                ordersContainer.innerHTML =
                    "<p>Unable to load your orders.</p>";

                return;
            }


            // ==========================================
            // CREATE MAIN ORDER SECTIONS
            // ==========================================

            ordersContainer.innerHTML = `

                <div class="current-orders-section">

                    <p class="orders-subtitle">
                        CURRENT ORDERS
                    </p>

                    <h3>Active Orders</h3>

                    <div id="active-orders-container"></div>

                </div>


                <div class="previous-orders-section">

                    <button
                        type="button"
                        id="previous-orders-btn"
                        class="previous-orders-btn"
                    >
                        View Previous Orders
                    </button>

                    <div
                        id="previous-orders-container"
                        style="display: none;"
                    >

                        <p class="orders-subtitle">
                            PREVIOUS ORDERS
                        </p>

                        <h3>Order History</h3>

                        <div id="history-orders-list"></div>

                    </div>

                </div>

            `;


            const activeOrdersContainer =
                document.getElementById(
                    "active-orders-container"
                );

            const historyOrdersContainer =
                document.getElementById(
                    "history-orders-list"
                );

            const previousOrdersSection =
                document.getElementById(
                    "previous-orders-container"
                );

            const previousOrdersButton =
                document.getElementById(
                    "previous-orders-btn"
                );


            // ==========================================
            // SEPARATE ACTIVE AND PREVIOUS ORDERS
            // ==========================================

            const activeStatuses = [
                "Pending",
                "Processing",
                "Out for Delivery"
            ];


            const activeOrders =
                data.orders.filter(function (order) {

                    return activeStatuses.includes(
                        order.order_status
                    );

                });


            const previousOrders =
                data.orders.filter(function (order) {

                    return !activeStatuses.includes(
                        order.order_status
                    );

                });


            // ==========================================
            // ACTIVE ORDERS
            // ==========================================

            if (activeOrders.length === 0) {

                activeOrdersContainer.innerHTML =
                    "<p>You have no active orders.</p>";

            } else {

                activeOrders.forEach(function (order) {

                    createOrderCard(
                        order,
                        activeOrdersContainer
                    );

                });

            }


            // ==========================================
            // PREVIOUS ORDERS
            // ==========================================

            if (previousOrders.length === 0) {

                historyOrdersContainer.innerHTML =
                    "<p>You have no previous orders.</p>";

                previousOrdersButton.style.display =
                    "none";

            } else {

                previousOrders.forEach(function (order) {

                    createOrderCard(
                        order,
                        historyOrdersContainer
                    );

                });

            }


            // ==========================================
            // SHOW / HIDE PREVIOUS ORDERS
            // ==========================================

            previousOrdersButton.addEventListener(
                "click",
                function () {

                    if (
                        previousOrdersSection.style.display ===
                        "none"
                    ) {

                        previousOrdersSection.style.display =
                            "block";

                        previousOrdersButton.textContent =
                            "Hide Previous Orders";

                    } else {

                        previousOrdersSection.style.display =
                            "none";

                        previousOrdersButton.textContent =
                            "View Previous Orders";

                    }

                }
            );

        })

        .catch(function (error) {

            console.error(
                "Order history error:",
                error
            );

            ordersContainer.innerHTML =
                "<p>Unable to load orders. Please check the backend.</p>";

        });
}

loadMyOrders();


window.increaseCartQuantity = increaseCartQuantity;
window.decreaseCartQuantity = decreaseCartQuantity;
window.removeCartItem = removeCartItem;

// ==============================
// CANCEL ORDER
// ==============================

function cancelOrder(orderId) {

    const customerId = localStorage.getItem("customerId");

    if (!customerId) {
        alert("Please login first.");
        return;
    }

    const confirmCancel = confirm(
        "Are you sure you want to cancel this order?"
    );

    if (!confirmCancel) {
        return;
    }

    fetch(
        "http://127.0.0.1:5000/api/orders/" +
        orderId +
        "/cancel",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                customer_id: Number(customerId)
            })
        }
    )

        .then(function (response) {
            return response.json();
        })

        .then(function (data) {

            if (data.success) {

                alert("Order cancelled successfully.");

                // Reload orders
                loadMyOrders();

            } else {

                alert(
                    data.message ||
                    "Unable to cancel the order."
                );

            }

        })

        .catch(function (error) {

            console.error("Cancel order error:", error);

            alert(
                "Unable to cancel order. Please check the backend."
            );

        });
}

window.cancelOrder = cancelOrder;