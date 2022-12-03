import './App.css';

function App() {
  return (
    <div className="App">
      <h1>Hello dear visitor! ❤️</h1>
      <p>
        {/* eslint-disable-next-line max-len */}
        This website is still under construction, kindly come back in the future to observe progress or check the status on tasks in the
        {' '}
        <a className="App-link" target="_blank" rel="noopener noreferrer" href="https://github.com/users/waldoibarra/projects/2">GitHub project</a>
        .
      </p>
      <p>
        {/* eslint-disable-next-line max-len */}
        If you want, you can see more detail on the code implementation (such as IaC and CI/CD) in the
        {' '}
        <a className="App-link" target="_blank" rel="noopener noreferrer" href="https://github.com/waldoibarra/portfolio">GitHub repository</a>
        . ✌️
      </p>
    </div>
  );
}

export default App;
