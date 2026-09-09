// =====================================================
// MALLELA MILKS - PRODUCT & ORDER SYSTEM
// =====================================================


// =====================================================
// PRODUCT QUANTITIES
// =====================================================

const quantities = {

    cowMilk: 0.5,

    buffaloMilk: 0.5,

    curd: 0.5,

    paneer: 0.25

};


// =====================================================
// CART
// =====================================================

let cart = [];


// =====================================================
// CHANGE QUANTITY
// =====================================================

function changeQuantity(productId, change) {

    let newQuantity =
        quantities[productId] + change;


    // Minimum quantity
    if (newQuantity < 0.5) {

        return;

    }


    quantities[productId] =
        Number(newQuantity.toFixed(2));


    document.getElementById(productId).textContent =
        quantities[productId];

}


// =====================================================
// ADD TO CART
// =====================================================

function addToCart(
    productName,
    price,
    unit,
    quantityId
) {

    const quantity =
        quantities[quantityId];


    const total =
        price * quantity;


    const existingProduct =
        cart.find(
            item => item.name === productName
        );


    if (existingProduct) {

        existingProduct.quantity += quantity;

        existingProduct.total =
            existingProduct.quantity * price;

    } else {

        cart.push({

            name: productName,

            price: price,

            unit: unit,

            quantity: quantity,

            total: total

        });

    }


    updateCart();


    alert(
        productName +
        " added to your cart."
    );

}


// =====================================================
// DISPLAY CART
// =====================================================

function updateCart() {

    const cartContainer =
        document.getElementById("cart-items");


    const subtotalElement =
        document.getElementById("subtotal");

    const deliveryElement =
        document.getElementById("delivery");

    const grandTotalElement =
        document.getElementById("grand-total");


    if (cart.length === 0) {

        cartContainer.innerHTML =
            '<p class="empty-cart">Your cart is empty.</p>';

        subtotalElement.textContent = "0";

        deliveryElement.textContent = "0";

        grandTotalElement.textContent = "0";

        return;

    }


    cartContainer.innerHTML = "";


    let subtotal = 0;


    cart.forEach(function (item, index) {

        subtotal += item.total;


        const cartItem =
            document.createElement("div");


        cartItem.className =
            "cart-item";


        cartItem.innerHTML = `

            <div>

                <h3>
                    ${item.name}
                </h3>

                <p>
                    ₹${item.price} / ${item.unit}
                </p>

                <p>
                    Quantity:
                    ${item.quantity}
                </p>

                <strong>
                    ₹${item.total.toFixed(2)}
                </strong>

            </div>

            <button
                class="remove-btn"
                onclick="removeFromCart(${index})"
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


    subtotalElement.textContent =
        subtotal.toFixed(2);


    deliveryElement.textContent =
        delivery.toFixed(2);


    grandTotalElement.textContent =
        grandTotal.toFixed(2);

}


// =====================================================
// REMOVE FROM CART
// =====================================================

function removeFromCart(index) {

    cart.splice(index, 1);

    updateCart();

}


// =====================================================
// CHECKOUT BUTTON
// =====================================================

function goToCheckout() {

    if (cart.length === 0) {

        alert(
            "Please add a product to your cart first."
        );

        return;

    }


    document
        .getElementById("checkout")
        .scrollIntoView({

            behavior: "smooth"

        });

}


// =====================================================
// PLACE ORDER
// =====================================================

function placeOrder(event) {

    event.preventDefault();


    if (cart.length === 0) {

        alert(
            "Your cart is empty."
        );

        return;

    }


    const name =
        document
            .getElementById("customer-name")
            .value
            .trim();


    const phone =
        document
            .getElementById("customer-phone")
            .value
            .trim();


    const address =
        document
            .getElementById("customer-address")
            .value
            .trim();


    // =================================================
    // VALIDATION
    // =================================================

    if (name === "") {

        alert(
            "Please enter your name."
        );

        return;

    }


    const phonePattern =
        /^[0-9]{10}$/;


    if (!phonePattern.test(phone)) {

        alert(
            "Please enter a valid 10-digit phone number."
        );

        return;

    }


    if (address === "") {

        alert(
            "Please enter your delivery address."
        );

        return;

    }


    // =================================================
    // ORDER SUMMARY
    // =================================================

    let orderSummary =
        "MALLELA MILKS ORDER\n\n";


    cart.forEach(function (item) {

        orderSummary +=
            item.name +
            " - " +
            item.quantity +
            " " +
            item.unit +
            " = ₹" +
            item.total.toFixed(2) +
            "\n";

    });


    const subtotal =
        cart.reduce(
            (sum, item) => sum + item.total,
            0
        );


    const delivery =
        subtotal >= 200 ? 0 : 30;


    const grandTotal =
        subtotal + delivery;


    orderSummary +=
        "\nSubtotal: ₹" +
        subtotal.toFixed(2);


    orderSummary +=
        "\nDelivery: ₹" +
        delivery.toFixed(2);


    orderSummary +=
        "\nTotal: ₹" +
        grandTotal.toFixed(2);


    orderSummary +=
        "\n\nCustomer: " +
        name;


    orderSummary +=
        "\nPhone: " +
        phone;


    orderSummary +=
        "\nAddress: " +
        address;


    // =================================================
    // TEMPORARY CONFIRMATION
    // =================================================

    alert(
        "ORDER READY!\n\n" +
        orderSummary +
        "\n\nReal order submission will be connected to the backend."
    );


    // Clear form

    document
        .getElementById("order-form")
        .reset();


    cart = [];


    updateCart();

}