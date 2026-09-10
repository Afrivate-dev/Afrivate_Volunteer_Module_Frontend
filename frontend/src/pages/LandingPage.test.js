import { render, screen } from '@testing-library/react';
import { HashRouter } from 'react-router-dom';
import Landing from './Landing';

const renderWithRouter = (component) => {
  return render(
    <HashRouter>
      {component}
    </HashRouter>
  );
};

describe('Landing', () => {
  test('renders main heading', () => {
    renderWithRouter(<Landing />);
    const headingElement = screen.getByText(/Volunteer Your Skills/i);
    expect(headingElement).toBeInTheDocument();
  });

  test('renders sign up links', () => {
    renderWithRouter(<Landing />);
    const signUpLinks = screen.getAllByRole('link', { name: /Sign up/i });
    expect(signUpLinks.length).toBeGreaterThan(0);
    const hasSignupHref = signUpLinks.some((el) => el.getAttribute('href')?.match(/#\/signup|#\/login/));
    expect(hasSignupHref).toBe(true);
  });

  test('renders navigation with volunteering link', () => {
    renderWithRouter(<Landing />);
    const volunteeringLinks = screen.getAllByRole('link', { name: /Volunteering/i });
    expect(volunteeringLinks.length).toBeGreaterThan(0);
    const volunteeringLink = volunteeringLinks[0];
    expect(volunteeringLink).toBeInTheDocument();
    expect(volunteeringLink.getAttribute('href')).toBe('#/opportunity');
  });
}); 