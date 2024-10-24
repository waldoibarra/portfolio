import { LitElement, html, css } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("app-element")
export class AppElement extends LitElement {
  static styles = css`
    .app {
      text-align: center;
      background-color: #282c34;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      /* font-size: calc(10px + 2vmin); */
      color: white;
    }

    .app-link {
      color: #61dafb;
    }
  `;

  render() {
    return html`
      <div class="app">
        <h1>Hello dear visitor! ❤️</h1>
        <p>
          This website is still under construction, kindly come back in the future to observe
          progress or check the status on tasks in the
          <a
            class="app-link"
            target="_blank"
            rel="noopener noreferrer"
            href="https://github.com/users/waldoibarra/projects/2"
          >
            GitHub project</a
          >.
        </p>
        <p>
          If you want, you can see more detail on the code implementation (such as IaC and CI/CD) in
          the
          <a
            class="app-link"
            target="_blank"
            rel="noopener noreferrer"
            href="https://github.com/waldoibarra/portfolio"
          >
            GitHub repository</a
          >. ✌️
        </p>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "app-element": AppElement;
  }
}
