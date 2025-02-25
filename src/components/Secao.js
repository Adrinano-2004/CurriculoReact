import React from "react";

function Secao({ titulo, children }) {
  return (
    <div className="secao">
      <h2>{titulo}</h2>
      {children}
    </div>
  );
}

export default Secao;