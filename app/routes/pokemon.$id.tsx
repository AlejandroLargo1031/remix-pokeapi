import { json } from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  NavLink,
  useLoaderData,
} from "@remix-run/react";

import type { LinksFunction } from "@remix-run/node";
import appStylesHref from "../app.css?url";

export const links: LinksFunction = () => [
  {
    rel: "stylesheet",
    href: appStylesHref,
  },
];

export const loader = async ({ params }) => {
  const { id } = params; 
  console.log("cargando params:", params); 

  const URL = `https://pokeapi.co/api/v2/pokemon/${id}`;
  console.log("URL:", URL); 

  const response = await fetch(URL);

  if (!response.ok) {
    console.error("error buscando pokemon:", response.statusText); 
    throw new Response("pokemon no encontrado", { status: 404 });
  }

  const pokemon = await response.json();

  return json({ pokemon });
};

export default function Pokemon() {
  const { pokemon } = useLoaderData<typeof loader>();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div id="pokemon-details">
          <h1>{pokemon.name}</h1>
          <img
            src={pokemon.sprites.front_default}
            alt={`imagen de pokemon${pokemon.name}`}
          />
          <ul>
            <li>Height: {pokemon.height}</li>
            <li>Weight: {pokemon.weight}</li>
            <li>Base Experience: {pokemon.base_experience}</li>
          </ul>
        </div>

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}