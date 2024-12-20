import { json,
  //  redirect 
  } from "@remix-run/node";

import { useState } from "react";

import {
  Form,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  // Link,
  useLoaderData,
  NavLink,
  useNavigate,
} from "@remix-run/react";

import type { LinksFunction } from "@remix-run/node";
import appStylesHref from "./app.css?url";

export const links: LinksFunction = () => [
  {
    rel: "stylesheet",
    href: appStylesHref,
  },
];

export const action = async () => {
  
};

export const loader = async (args: { request: Request }) => {
  const url = new URL(args.request.url);
  const page = Number(url.searchParams.get("page")) || 1;

  console.log("Página solicitada:", page); 

  const limit = 20;
  const offset = (page - 1) * limit; 

  const API_URL = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`;
  console.log("URL generada:", API_URL); 

  const response = await fetch(API_URL);

  if (!response.ok) {
    console.error("Error en la API:", response.statusText);
    throw new Response("Error al cargar los datos", { status: response.status });
  }

  const data = await response.json();
  const pokemons = data.results.map((pokemon: { name: string; url: string }, index: number) => ({
    id: offset + index + 1,
    name: pokemon.name,
    url: pokemon.url,
  }));

  return json({ pokemons, page, hasNext: data.next !== null });
};


export default function App() {
  const navigate = useNavigate();
  const { pokemons, page, hasNext } = useLoaderData<typeof loader>();
    const [searchResults, setSearchResults] = useState(pokemons);
  const [q, setQuery] = useState("");

  console.log("Página actual:", page);

  const handlePrevious = () => {
    if (page > 1) {
      navigate(`?page=${page - 1}`);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      navigate(`?page=${page + 1}`);
    }
  };

   const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchQuery = event.target.value.toLowerCase();
    setQuery(searchQuery);
    console.log("Consultando pokemones con el nombre:", searchQuery);  

    const filteredPokemons = pokemons.filter((pokemon: { id: number; name: string; url: string }) =>
      pokemon.name.toLowerCase().includes(searchQuery)
    );
    setSearchResults(filteredPokemons);
  };


  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div id="sidebar">
          <h1>Remix Pokemons</h1>
          <div>
            <Form id="search-form" role="search">
              <input
                id="q"
                aria-label="Search Pokemon"
                placeholder="Search"
                type="search"
                name="q"
                value={q}
                onChange={handleSearch}
              />
              <div id="search-spinner" aria-hidden hidden={true} />
            </Form>

            <button onClick={handlePrevious} disabled={page === 1}>
            Previous
          </button>
          <br />
          <button onClick={handleNext} disabled={!hasNext}>
            Next
          </button>
          </div>
         
          <nav>
            {pokemons?.length ? (
              <ul>
                {searchResults.map((pokemon: { id: number; name: string; url: string }) => (
                  <li key={pokemon.id}>
                    <NavLink
                      className={({ isActive, isPending }) =>
                        isActive ? "active" : isPending ? "pending" : ""
                      }
                      to={`pokemon/${pokemon.id}`}
                    >
                      {pokemon.name}
                    </NavLink>
                  </li>
                ))}
              </ul>
            ) : ( 
              <p>
                <i> Pokémon no found</i>
              </p>
            )}
          </nav>
        </div>
        <div id="detail">
          <Outlet />
        </div>

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
