import { Component } from '@angular/core';

@Component({
  selector: 'app-demo-componente',
  standalone: true,
  template: `
    <div class="contenedor">
      <h1>{{ titulo }}</h1>
      <p>Contador: <strong>{{ contador }}</strong></p>
      
      <button (click)="incrementar()" class="boton">Incrementar</button>
      <button (click)="decrementar()" class="boton">Decrementar</button>
    </div>
  `,
  styles: [`
    .contenedor {
      max-width: 500px;
      margin: 50px auto;
      padding: 30px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 10px;
      color: white;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      font-family: Arial, sans-serif;
    }

    h1 {
      margin: 0 0 20px 0;
      font-size: 2em;
    }

    p {
      font-size: 1.2em;
      margin: 20px 0;
    }

    strong {
      color: #ffeb3b;
      font-size: 1.5em;
    }

    .boton {
      padding: 12px 30px;
      margin: 10px;
      font-size: 1em;
      border: none;
      border-radius: 5px;
      background: white;
      color: #667eea;
      cursor: pointer;
      font-weight: bold;
      transition: transform 0.2s;
    }

    .boton:hover {
      transform: scale(1.05);
    }
  `]
})
export class DemoComponenteComponent {
  // Propiedad: datos del componente
  titulo = 'Contador Simple';
  contador = 0;

  // Método: incrementa el contador
  incrementar() {
    this.contador++;
  }

  // Método: decrementa el contador
  decrementar() {
    this.contador--;
  }
}
