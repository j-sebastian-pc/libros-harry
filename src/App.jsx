import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [libros, setLibros] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [totalAPagar, setTotalAPagar] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarCarrito, setMostrarCarrito] = useState(false);

  useEffect(() => {
    async function fetchLibros() {
      try {
        const response = await axios.get();
        setLibros(response.data.libros);
        setIsLoading(false);
      } catch (error) {
        setError(error);
        setIsLoading(false);
      }
    }

    fetchLibros();
  }, []);

  useEffect(() => {
    const total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
    setTotalAPagar(total);
  }, [carrito]);

/* agregar al carrito */ 

const agregarAlCarrito = (libro) => {
  const libroExistente = carrito.find((item) => item.id === libro.id);
  if (libroExistente) {
    const carritoActualizado = carrito.map((item) =>
      item.id === libro.id ? { ...item, cantidad: item.cantidad + 1 } : item
    );
    setCarrito(carritoActualizado);
  } else {
    setCarrito([...carrito, { ...libro, cantidad: 1 }]);
  }

  const librosActualizados = libros.map((item) => {
    if (item.id === libro.id) {
      const cantidadDisponible = item.cantidadDisponible - 1;
      if (cantidadDisponible < 0) {
        toast.error(`${libro.libro} está agotado!`);
        return { ...item, cantidadDisponible: 0, agotado: true };
      }
      return { ...item, cantidadDisponible };
    }
    return item;
  });

  setLibros(librosActualizados);
  toast.success(`${libro.libro} agregado al carrito`);
};

  /*disminuir cantidad*/ 

  const disminuirCantidad = (libro) => {
    const libroExistenteIndex = carrito.findIndex((item) => item.id === libro.id);
    if (libroExistenteIndex !== -1) {
      const carritoActualizado = [...carrito];
      const libroExistente = carritoActualizado[libroExistenteIndex];
      if (libroExistente.cantidad === 1) {
        carritoActualizado.splice(libroExistenteIndex, 1);
      } else {
        carritoActualizado[libroExistenteIndex].cantidad -= 1;
      }

      const librosActualizados = libros.map((item) => {
        if (item.id === libro.id) {
          return { ...item, cantidadDisponible: item.cantidadDisponible + 1 };
        }
        return item;
      });

      setLibros(librosActualizados);
      setCarrito(carritoActualizado);
    }
  };

  /* eliminar del carrito*/

  const eliminarDelCarrito = (libro) => {
    const carritoActualizado = carrito.filter((item) => item.id !== libro.id);
    setCarrito(carritoActualizado);

    const librosActualizados = libros.map((item) => {
      if (item.id === libro.id) {
        return { ...item, cantidadDisponible: item.cantidadDisponible + libro.cantidad };
      }
      return item;
    });

    setLibros(librosActualizados);
    toast.error(`${libro.libro} eliminado del carrito`);
  };

  /* realizar la compra*/

  const realizarCompra = () => {
    if (carrito.length === 0) {
      toast.error("No hay productos en el carrito para comprar.");
      return;
    }

    const itemsOutOfStock = carrito.filter((item) => item.cantidad > item.cantidadDisponible);

    if (itemsOutOfStock.length > 0) {
      const itemNames = itemsOutOfStock.map((item) => item.libro).join(", ");
      toast.error(`Los siguientes productos están agotados: ${itemNames}`);
      return;
    }

    const librosActualizados = libros.map((item) => {
      const itemInCart = carrito.find((cartItem) => cartItem.id === item.id);
      if (itemInCart) {
        return {
          ...item,
          cantidadDisponible: item.cantidadDisponible - itemInCart.cantidad,
        };
      }
      return item;
    });

    setLibros(librosActualizados);
    setCarrito([]);
    toast.success("Compra realizada con éxito.");
  };

    /* mostrar carrito  */

  const mostrarCarritoHandler = () => {
    setMostrarCarrito(!mostrarCarrito);
  };

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="container">
      <h1>Harry Book - Tienda Online</h1>
      <hr />
      <h2>Libros Disponibles</h2>
      <button onClick={mostrarCarritoHandler}>
        {mostrarCarrito ? 'Ocultar Carrito' : 'Ir al carrito'}
      </button>
      {mostrarCarrito && (
        <div className="carrito">
          <h3>Carrito de Compras</h3>
          <ul>
            {carrito.map((item) => (
              <li key={item.id}>
                {item.libro} - Cantidad: {item.cantidad}
                <button onClick={() => disminuirCantidad(item)}>Disminuir</button>
                <button onClick={() => eliminarDelCarrito(item)}>Eliminar</button>
                {item.agotado && <span> - Agotado</span>}
              </li>
            ))}
          </ul>
          <p style={{ textAlign: 'center', fontSize: '24px' }} className='TotalPagar'>
            <b>Total a Pagar: $</b>{totalAPagar.toFixed(2)}
          </p>
          <button onClick={realizarCompra}>Comprar</button>
        </div>
      )}
      <ul>
        {libros.map((libro) => (
          <li key={libro.id}>
            <img
              className="book-image"
              src={libro.imagen}
              alt={`Portada de ${libro.libro}`}
            />
            <div>
              <strong>Libro:</strong> {libro.libro}
              <br />
              <strong>Cantidad disponible:</strong> {libro.cantidadDisponible === 0 ? "Agotado" : libro.cantidadDisponible}
              <br />
              <strong>Precio:</strong> ${parseFloat(libro.precio).toFixed(2)}
              <br />
              <strong>Agregar producto:</strong>
              <button
                onClick={() => agregarAlCarrito(libro)}
                disabled={libro.cantidadDisponible === 0}
              >
                Agregar
              </button>
              <br />
              {carrito.find((item) => item.id === libro.id) && (
                <span>Cantidad en carrito: {carrito.find((item) => item.id === libro.id).cantidad}</span>
              )}
            </div>
          </li>
        ))}
      </ul>
      <ToastContainer />
    </div>
  );
}

export default App;
