"use strict";

function hello(html) {
  return (
    html`
      <div>
        hello
      </div>
    `
  );
}

export default function world(html) {
  return (
    html`
      <div>
        ${hello(html)} world
      </div>
    `
  );
}
