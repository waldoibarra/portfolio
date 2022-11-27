import { render, screen } from '@testing-library/react';
import App from '../src/App';

test('Renders hello dear visitor heading', () => {
  render(<App />);
  const headingElement = screen.getByText(/hello dear visitor/i);
  expect(headingElement).toBeInTheDocument();
});
