window.onload = function() {

    fetchProduct();


};



function fetchProduct() {

    fetch('http://localhost:3000/getProducts')
        .then(function(data) {
            return data.json()
        })
        .then(function(res) {

            loadProduct(res.data)
        })

}

function loadProduct(data) {

    let products = id('products');
    for (var i = 0; i < data.length; i++) {
        let p = document.createElement("p");
        let img = document.createElement("img");
        img.src = data[i].icon
        img.classList.add('img')
        p.textContent = data[i].title
        let elem = document.createElement("div");
        elem.setAttribute('id', data[i].appId);
        elem.classList.add('product')
        elem.appendChild(img);
        elem.appendChild(p);
        let a = document.createElement('a');
        let linkText = document.createTextNode(data[i].appId);
        a.appendChild(linkText);
        a.title = data[i].appId;
        a.href = "detail.html?id=" + data[i].appId;
        elem.appendChild(a);
        products.appendChild(elem);
    }


}


function id(id) {
    return document.getElementById(id)
}

function querySelector(selector) {

    return document.querySelector(selector)
}

function querySelectorAll(selector) {

    return document.querySelectorAll(selector)
}