import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { jest } from '@jest/globals';
import InteractiveQuiz from '../../pages/InteractiveQuiz';

// Mock dependencies
jest.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id', name: 'Test User' }
  })
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ moduleId: 'test-module', chapterId: 'test-chapter' }),
  useNavigate: () => jest.fn()
}));

// Mock fetch
global.fetch = jest.fn();

const mockQuizData = {
  id: '1',
  moduleId: 'test-module',
  timeLimit: 1800,
  passingScore: 70,
  allowRetakes: true,
  showExplanations: true,
  randomizeQuestions: false,
  questions: [
    {
      id: '1',
      question: 'What should you do first when you discover a fire?',
      options: [
        'Try to put it out yourself',
        'Sound the fire alarm immediately',
        'Gather your belongings',
        'Take a photo'
      ],
      correct: 1,
      explanation: 'Always sound the fire alarm first to alert everyone.',
      difficulty: 'medium',
      category: 'Fire Safety',
      points: 10,
      timeLimit: 30,
      hint: 'Think about alerting others first.'
    }
  ]
};

const MockWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('InteractiveQuiz Component', () => {
  beforeEach(() => {
    (fetch as jest.MockedFunction<typeof fetch>).mockClear();
  });

  test('renders loading state initially', () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: () => Promise.resolve(mockQuizData)
      } as Response), 1000))
    );

    render(
      <MockWrapper>
        <InteractiveQuiz />
      </MockWrapper>
    );

    expect(screen.getByTestId('quiz-loading')).toBeInTheDocument();
  });

  test('renders quiz question after loading', async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockQuizData)
    } as Response);

    render(
      <MockWrapper>
        <InteractiveQuiz />
      </MockWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Interactive Safety Quiz')).toBeInTheDocument();
      expect(screen.getByText(mockQuizData.questions[0].question)).toBeInTheDocument();
    });
  });

  test('allows user to select answer', async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockQuizData)
    } as Response);

    render(
      <MockWrapper>
        <InteractiveQuiz />
      </MockWrapper>
    );

    await waitFor(() => {
      const answerButton = screen.getByText('Sound the fire alarm immediately');
      fireEvent.click(answerButton);
      expect(answerButton).toHaveClass('border-primary');
    });
  });

  test('shows explanation when requested', async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockQuizData)
    } as Response);

    render(
      <MockWrapper>
        <InteractiveQuiz />
      </MockWrapper>
    );

    await waitFor(() => {
      const answerButton = screen.getByText('Sound the fire alarm immediately');
      fireEvent.click(answerButton);
      
      const explainButton = screen.getByText('Show Explanation');
      fireEvent.click(explainButton);
      
      expect(screen.getByText('Explanation:')).toBeInTheDocument();
      expect(screen.getByText(mockQuizData.questions[0].explanation)).toBeInTheDocument();
    });
  });

  test('shows hint when requested', async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockQuizData)
    } as Response);

    render(
      <MockWrapper>
        <InteractiveQuiz />
      </MockWrapper>
    );

    await waitFor(() => {
      const hintButton = screen.getByText('Hint');
      fireEvent.click(hintButton);
      
      expect(screen.getByText('Hint: Think about alerting others first.')).toBeInTheDocument();
    });
  });

  test('displays timer and progress', async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockQuizData)
    } as Response);

    render(
      <MockWrapper>
        <InteractiveQuiz />
      </MockWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('30:00')).toBeInTheDocument(); // Timer
      expect(screen.getByText('1 / 1')).toBeInTheDocument(); // Progress
    });
  });

  test('handles quiz completion', async () => {
    (fetch as jest.MockedFunction<typeof fetch>)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockQuizData)
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      } as Response);

    render(
      <MockWrapper>
        <InteractiveQuiz />
      </MockWrapper>
    );

    await waitFor(() => {
      // Select correct answer
      const answerButton = screen.getByText('Sound the fire alarm immediately');
      fireEvent.click(answerButton);
      
      // Finish quiz
      const finishButton = screen.getByText('Finish Quiz');
      fireEvent.click(finishButton);
      
      expect(screen.getByText('Quiz Complete!')).toBeInTheDocument();
    });
  });

  test('displays correct score and badge', async () => {
    (fetch as jest.MockedFunction<typeof fetch>)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockQuizData)
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      } as Response);

    render(
      <MockWrapper>
        <InteractiveQuiz />
      </MockWrapper>
    );

    await waitFor(async () => {
      // Select correct answer
      const answerButton = screen.getByText('Sound the fire alarm immediately');
      fireEvent.click(answerButton);
      
      // Finish quiz
      const finishButton = screen.getByText('Finish Quiz');
      fireEvent.click(finishButton);
      
      await waitFor(() => {
        expect(screen.getByText('100%')).toBeInTheDocument(); // Perfect score
        expect(screen.getByText('1/1')).toBeInTheDocument(); // Correct answers
        expect(screen.getByText(/Safety Master|Lightning Expert/)).toBeInTheDocument(); // Badge
      });
    });
  });

  test('handles API errors gracefully', async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
      new Error('API Error')
    );

    render(
      <MockWrapper>
        <InteractiveQuiz />
      </MockWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to load quiz. Please try again.')).toBeInTheDocument();
    });
  });

  test('prevents multiple submissions', async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockQuizData)
    } as Response);

    render(
      <MockWrapper>
        <InteractiveQuiz />
      </MockWrapper>
    );

    await waitFor(() => {
      const answerButton = screen.getByText('Sound the fire alarm immediately');
      fireEvent.click(answerButton);
      
      // Show explanation first
      const explainButton = screen.getByText('Show Explanation');
      fireEvent.click(explainButton);
      
      // Answer buttons should be disabled after explanation
      expect(answerButton).toBeDisabled();
    });
  });

  test('confidence rating works correctly', async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockQuizData)
    } as Response);

    render(
      <MockWrapper>
        <InteractiveQuiz />
      </MockWrapper>
    );

    await waitFor(() => {
      // Select answer first
      const answerButton = screen.getByText('Sound the fire alarm immediately');
      fireEvent.click(answerButton);
      
      // Confidence rating should appear
      expect(screen.getByText('How confident are you in your answer?')).toBeInTheDocument();
      
      // Click confidence level
      const confidenceButton = screen.getByText('Very sure');
      fireEvent.click(confidenceButton);
      
      expect(confidenceButton).toHaveClass('bg-primary');
    });
  });
});
