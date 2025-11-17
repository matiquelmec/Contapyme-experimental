// 🧪 Button Component Tests - Enterprise Testing Example
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button, ButtonProps } from '../Button';

// 🎭 Test utilities
const renderButton = (props: Partial<ButtonProps> = {}) => {
  const defaultProps: ButtonProps = {
    children: 'Test Button',
    ...props,
  };
  return render(<Button {...defaultProps} />);
};

describe('Button Component', () => {
  // 🧹 Clean up after each test
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ✅ Basic rendering tests
  describe('Rendering', () => {
    it('renders with default props', () => {
      renderButton();
      const button = screen.getByRole('button', { name: /test button/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('bg-primary-600'); // Default primary variant
    });

    it('renders children correctly', () => {
      renderButton({ children: 'Custom Button Text' });
      expect(screen.getByRole('button', { name: /custom button text/i })).toBeInTheDocument();
    });

    it('renders with custom className', () => {
      renderButton({ className: 'custom-class' });
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });
  });

  // 🎨 Variant tests
  describe('Variants', () => {
    const variants: Array<ButtonProps['variant']> = [
      'primary',
      'secondary',
      'success',
      'warning',
      'danger',
      'ghost',
      'outline',
    ];

    variants.forEach((variant) => {
      it(`renders ${variant} variant correctly`, () => {
        renderButton({ variant });
        const button = screen.getByRole('button');

        // Test that variant-specific classes are applied
        switch (variant) {
          case 'primary':
            expect(button).toHaveClass('bg-primary-600');
            break;
          case 'secondary':
            expect(button).toHaveClass('bg-gray-100');
            break;
          case 'success':
            expect(button).toHaveClass('bg-success-600');
            break;
          case 'warning':
            expect(button).toHaveClass('bg-warning-500');
            break;
          case 'danger':
            expect(button).toHaveClass('bg-error-600');
            break;
          case 'ghost':
            expect(button).toHaveClass('hover:bg-gray-100');
            break;
          case 'outline':
            expect(button).toHaveClass('border-2');
            break;
        }
      });
    });
  });

  // 📏 Size tests
  describe('Sizes', () => {
    const sizes: Array<ButtonProps['size']> = ['xs', 'sm', 'md', 'lg', 'xl'];

    sizes.forEach((size) => {
      it(`renders ${size} size correctly`, () => {
        renderButton({ size });
        const button = screen.getByRole('button');

        // Test that size-specific classes are applied
        switch (size) {
          case 'xs':
            expect(button).toHaveClass('h-7');
            break;
          case 'sm':
            expect(button).toHaveClass('h-8');
            break;
          case 'md':
            expect(button).toHaveClass('h-10');
            break;
          case 'lg':
            expect(button).toHaveClass('h-11');
            break;
          case 'xl':
            expect(button).toHaveClass('h-12');
            break;
        }
      });
    });
  });

  // 🎯 State tests
  describe('States', () => {
    it('renders loading state correctly', () => {
      renderButton({ loading: true });
      const button = screen.getByRole('button');

      // Should show loading spinner
      const spinner = button.querySelector('svg');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('animate-spin');

      // Should be disabled when loading
      expect(button).toBeDisabled();
    });

    it('renders disabled state correctly', () => {
      renderButton({ disabled: true });
      const button = screen.getByRole('button');

      expect(button).toBeDisabled();
      expect(button).toHaveClass('opacity-50', 'cursor-not-allowed');
    });

    it('shows full width when fullWidth is true', () => {
      renderButton({ fullWidth: true });
      const button = screen.getByRole('button');
      expect(button).toHaveClass('w-full');
    });
  });

  // 🎨 Icon tests
  describe('Icons', () => {
    const MockIcon = () => <span data-testid="test-icon">Icon</span>;

    it('renders left icon correctly', () => {
      renderButton({ leftIcon: <MockIcon /> });
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('renders right icon correctly', () => {
      renderButton({ rightIcon: <MockIcon /> });
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('does not render icons when loading', () => {
      renderButton({
        loading: true,
        leftIcon: <MockIcon />,
        rightIcon: <MockIcon />,
      });

      expect(screen.queryByTestId('test-icon')).not.toBeInTheDocument();
    });
  });

  // 🖱️ Interaction tests
  describe('Interactions', () => {
    it('calls onClick when clicked', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();

      renderButton({ onClick: handleClick });
      const button = screen.getByRole('button');

      await user.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();

      renderButton({ onClick: handleClick, disabled: true });
      const button = screen.getByRole('button');

      await user.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('does not call onClick when loading', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();

      renderButton({ onClick: handleClick, loading: true });
      const button = screen.getByRole('button');

      await user.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('handles keyboard navigation (Enter)', () => {
      const handleClick = jest.fn();
      renderButton({ onClick: handleClick });
      const button = screen.getByRole('button');

      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('handles keyboard navigation (Space)', () => {
      const handleClick = jest.fn();
      renderButton({ onClick: handleClick });
      const button = screen.getByRole('button');

      fireEvent.keyDown(button, { key: ' ', code: 'Space' });
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  // ♿ Accessibility tests
  describe('Accessibility', () => {
    it('has correct ARIA attributes', () => {
      renderButton({ disabled: true });
      const button = screen.getByRole('button');

      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('has correct focus behavior', async () => {
      const user = userEvent.setup();
      renderButton();
      const button = screen.getByRole('button');

      await user.tab();
      expect(button).toHaveFocus();
    });

    it('cannot receive focus when disabled', async () => {
      const user = userEvent.setup();
      renderButton({ disabled: true });
      const button = screen.getByRole('button');

      await user.tab();
      expect(button).not.toHaveFocus();
    });

    it('has visible focus indicator', () => {
      renderButton();
      const button = screen.getByRole('button');

      // Check that focus styles are applied
      expect(button).toHaveClass('focus:outline-none', 'focus:ring-2');
    });
  });

  // 🎪 Edge cases
  describe('Edge Cases', () => {
    it('handles empty children gracefully', () => {
      renderButton({ children: null });
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('handles very long text', () => {
      const longText = 'A'.repeat(1000);
      renderButton({ children: longText });
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button.textContent).toBe(longText);
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<Button ref={ref}>Test</Button>);
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });
  });

  // 📊 Performance tests
  describe('Performance', () => {
    it('renders quickly', () => {
      const startTime = performance.now();
      renderButton();
      const endTime = performance.now();

      // Should render in less than 10ms
      expect(endTime - startTime).toBeLessThan(10);
    });

    it('does not cause unnecessary re-renders', () => {
      let renderCount = 0;
      const TestButton = (props: ButtonProps) => {
        renderCount++;
        return <Button {...props} />;
      };

      const { rerender } = render(<TestButton>Test</TestButton>);
      expect(renderCount).toBe(1);

      rerender(<TestButton>Test</TestButton>);
      expect(renderCount).toBe(2); // Should only re-render when needed
    });
  });

  // 🔄 Integration tests
  describe('Integration', () => {
    it('works within forms', () => {
      const handleSubmit = jest.fn();
      render(
        <form onSubmit={handleSubmit}>
          <Button type="submit">Submit</Button>
        </form>
      );

      const button = screen.getByRole('button', { name: /submit/i });
      fireEvent.click(button);

      expect(handleSubmit).toHaveBeenCalled();
    });

    it('maintains consistent styling across renders', () => {
      const { rerender } = renderButton({ variant: 'primary' });
      const button = screen.getByRole('button');
      const initialClasses = button.className;

      rerender(<Button variant="primary">Test Button</Button>);
      expect(button.className).toBe(initialClasses);
    });
  });
});