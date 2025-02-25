import React from "react";
import Perfil from "./components/Perfil";
import Secao from "./components/Secao";
import "./App.css";

function App() {
  return (
    <div className="container">
      <Perfil
        nome="Guilherme Lery Costa Americano Freire"
        foto="https://cdn.discordapp.com/attachments/1050209919309185106/1343759257409159208/remix-7369509d-e221-4309-bc42-8cfed95c5e77.png?ex=67be70d4&is=67bd1f54&hm=00966b6ddfdcc3eda8f3ccec782b3d6d9ebcc9e2b8070cdea6cdc3b73669dc0f&"
        contato="(32) 98419-7765"
        email="americanoguilherme2@gmail.com"
        linkedin="https://br.linkedin.com/"
      />

      <Secao titulo="Resumo">
        <hr></hr>
        <p>
          Estudante de Engenharia de Software, em busca de aprendizado e desenvolvimento na área de tecnologia.
          Possui conhecimento acadêmico em programação, banco de dados e redes de computadores, além de familiaridade com desenvolvimento de software. Proativo, com facilidade para aprender e trabalhar em equipe, busca oportunidades para ganhar experiência prática e contribuir com soluções inovadoras no setor de TI.
        </p>
      </Secao>

      <Secao titulo="Cursos e Certificações">
        <hr></hr>
        <ul>
          <li><strong>Html 5</strong> - Alura (2024 - Atual)</li>
          <li><strong>Css 3</strong> - Alura (2024 - Atual)</li>
          <li><strong>Java Script</strong> - Alura (2024 - Atual)</li>
        </ul>
      </Secao>

      <Secao titulo="Formação Acadêmica">
        <hr></hr>
        <p><strong>Bacharelado em Engenharia de Software</strong> - UniAcademia - Juiz de Fora (2024 - Atual)</p>
      </Secao>

      <Secao titulo="Habilidades e Competências">
        <hr></hr>
        <ul>
          <li>Comunicativo</li>
          <li>Proativo</li>
          <li>Inglês avançado</li>
          <li>Facilidade de aprendizado</li>
        </ul>
      </Secao>

      <Secao titulo="Informações Adicionais">
        <hr></hr>
        <p>Olá professor, não me reprove por favor !!!!!!!!!!!!</p>
      </Secao>
    </div>
  );
}

export default App;
