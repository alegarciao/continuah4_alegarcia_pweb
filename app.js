(function ($) {
  "use strict";

  var CART_KEY = "bettesConesCart";
  var flavorDescriptions = {
    cookie: "Vainilla cremosa con trozos gigantes de galleta",
    pistachio: "Pistacho tostado de Sicilia con laminas crujientes",
    strawberry: "Fresas frescas de temporada maceradas en crema",
    "black-cherry": "Cerezas negras silvestres con un toque de licor",
    midnight: "Cacao al 70% de origen unico, denso y oscuro",
    mango: "Sorbete de mango maduro con una pizca de lima",
    bean: "Vainilla de Madagascar real con granos visibles",
    toffee: "Caramelo salado quemado a mano con trozos crujientes",
    "cono-extra": "Complemento para acompanar tu helado artesanal",
    "topping-caramelo": "Caramelo dorado preparado en casa"
  };

  var flavorImages = {
    "flavor-cookie": "https://i.pinimg.com/1200x/21/c1/25/21c12533e2aa2e15fb1b93165a5dd565.jpg",
    "flavor-pistachio": "https://i.pinimg.com/1200x/bc/5d/31/bc5d31a6d688ec521aba6729ba9d3104.jpg",
    "flavor-strawberry": "https://i.pinimg.com/736x/54/6e/f6/546ef60b78d25fdd8c856ed044dcf56f.jpg",
    "flavor-cherry": "https://i.pinimg.com/736x/1f/bc/81/1fbc81171bdc81f19bf811792771f735.jpg",
    "flavor-midnight": "https://i.pinimg.com/1200x/34/03/3d/34033d4ce6d072af8c3ec77bb9ffe421.jpg",
    "flavor-mango": "https://i.pinimg.com/1200x/4e/af/8c/4eaf8cd496588cc3df15af96f0386021.jpg",
    "flavor-bean": "https://i.pinimg.com/736x/3c/38/d7/3c38d79b5e37ee5a51c8fafb67e6e268.jpg",
    "flavor-toffee": "https://i.pinimg.com/1200x/bc/fd/c6/bcfdc6732186490c0d6998d9a765d53c.jpg",
    "extra-cone": "https://i.pinimg.com/736x/2b/c8/92/2bc892b53447dbb23d4a59bc1c14989c.jpg",
    "extra-caramel": "https://i.pinimg.com/736x/30/d4/73/30d4730b86c16f468e740748e23ce28f.jpg"
  };

  function money(value) {
    return "Bs" + Number(value || 0).toFixed(2);
  }

  function readCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch (error) {
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartCount();
  }

  function addItem(item) {
    var cart = readCart();
    var existing = cart.find(function (cartItem) {
      return cartItem.id === item.id;
    });

    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({
        id: item.id,
        name: item.name,
        price: Number(item.price),
        image: item.image,
        qty: 1
      });
    }

    saveCart(cart);
  }

  function updateQuantity(id, nextQuantity) {
    var cart = readCart()
      .map(function (item) {
        if (item.id === id) {
          item.qty = nextQuantity;
        }
        return item;
      })
      .filter(function (item) {
        return item.qty > 0;
      });

    saveCart(cart);
    renderCart();
  }

  function removeItem(id) {
    saveCart(readCart().filter(function (item) {
      return item.id !== id;
    }));
    renderCart();
  }

  function subtotal(cart) {
    return cart.reduce(function (total, item) {
      return total + item.price * item.qty;
    }, 0);
  }

  function updateCartCount() {
    var count = readCart().reduce(function (total, item) {
      return total + item.qty;
    }, 0);

    $(".cart-count").text(count ? "(" + count + ")" : "");
  }

  function showToast(message) {
    var $toast = $("#toast");
    if (!$toast.length) {
      return;
    }

    $toast.text(message).addClass("show");
    window.setTimeout(function () {
      $toast.removeClass("show");
    }, 1800);
  }

  function renderCart() {
    var cart = readCart();
    var $items = $("#cartItems");
    var total = subtotal(cart);

    if (!$items.length) {
      return;
    }

    $items.empty();
    $("#emptyCart").toggle(cart.length === 0);

    cart.forEach(function (item) {
      var description = flavorDescriptions[item.id] || "Sabor artesanal seleccionado";
      var imageSrc = flavorImages[item.image] || "https://via.placeholder.com/400x400?text=Gelato";
      var $item = $(
        '<article class="cart-item">' +
        '<div class="crop cart-thumb"><img src="' + imageSrc + '" alt="' + item.name + '"></div>' +
        '<div class="cart-details">' +
        '<h3></h3>' +
        '<p></p>' +
        '<div class="qty-controls">' +
        '<button class="qty-minus" type="button" aria-label="Restar">-</button>' +
        '<span></span>' +
        '<button class="qty-plus" type="button" aria-label="Sumar">+</button>' +
        '</div>' +
        '</div>' +
        '<div class="cart-price">' +
        '<strong></strong>' +
        '<button class="remove-item" type="button">Eliminar</button>' +
        '</div>' +
        '</article>'
      );

      $item.attr("data-id", item.id);
      $item.find("h3").text(item.name);
      $item.find("p").text(description);
      $item.find(".qty-controls span").text(item.qty);
      $item.find(".cart-price strong").text(money(item.price * item.qty));
      $items.append($item);
    });

    $("#subtotal, #total").text(money(total));
  }

  function wireFlavorButtons() {
    $(".add-flavor").on("click", function () {
      var $card = $(this).closest(".flavor-card");
      var item = {
        id: $card.data("id"),
        name: $card.data("name"),
        price: $card.data("price"),
        image: $card.data("image")
      };

      addItem(item);
      $card.addClass("selected");
      $(this).text("Agregado");
      showToast(item.name + " agregado al carrito");

      window.setTimeout(function () {
        $card.removeClass("selected");
        $card.find(".add-flavor").text("Seleccionar Sabor");
      }, 1100);
    });
  }

  function wireCartButtons() {
    $(document).on("click", ".qty-plus", function () {
      var id = $(this).closest(".cart-item").data("id");
      var item = readCart().find(function (entry) {
        return entry.id === id;
      });
      updateQuantity(id, item.qty + 1);
    });

    $(document).on("click", ".qty-minus", function () {
      var id = $(this).closest(".cart-item").data("id");
      var item = readCart().find(function (entry) {
        return entry.id === id;
      });
      updateQuantity(id, item.qty - 1);
    });

    $(document).on("click", ".remove-item", function () {
      removeItem($(this).closest(".cart-item").data("id"));
    });

    $(".extra-card").on("click", function () {
      var $extra = $(this);
      addItem({
        id: $extra.data("id"),
        name: $extra.data("name"),
        price: $extra.data("price"),
        image: $extra.data("image")
      });
      renderCart();
      showToast($extra.data("name") + " agregado");
    });
  }

  function wireForms() {
    $(".payment").on("click", function () {
      $(".payment").removeClass("active");
      $(this).addClass("active");
      $(this).find("input").prop("checked", true);
    });

    $(".inline-form").on("submit", function (event) {
      event.preventDefault();
      this.reset();
      showToast("Gracias, pronto recibiras novedades");
    });

    $("#checkoutForm").on("submit", function (event) {
      event.preventDefault();

      if (!readCart().length) {
        showToast("Agrega al menos un sabor");
        return;
      }

      localStorage.removeItem(CART_KEY);
      renderCart();
      updateCartCount();
      this.reset();
      $(".payment").removeClass("active").first().addClass("active");
      showToast("Pedido completado correctamente");
    });
  }

  $(function () {
    updateCartCount();
    wireFlavorButtons();
    wireCartButtons();
    wireForms();
    renderCart();
  });
})(jQuery);
