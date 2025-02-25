import React from "react";

function Perfil({ nome, foto, contato, email, linkedin }) {
  return (
    <div className="perfil">
      <img src={foto} alt="Foto de perfil" />
      <h1>{nome}</h1>
      <p><strong>Contato:</strong> {contato}</p>
      <p><strong>Email:</strong> {email}</p>
      <p><a href={`https://${linkedin}`} target="_blank" rel="noopener noreferrer">{linkedin}</a></p>
    </div>
  );
}

export default Perfil;