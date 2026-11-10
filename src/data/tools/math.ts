import type { Tool } from './types';

export const mathTools: Tool[] = [
  {
    id: 'PercentageCalculator',
    slug: 'percentage-calculator',
    name: 'Percentage Calculator',
    category: 'student',
    shortDescription: 'Perform quick percentage calculations, ratio analyses, and percentage change outputs.',
    metaDescription: 'Free online Percentage Calculator. Solve "X% of Y", "X is what % of Y", and percentage increase/decrease instantly in your local browser.',
    keywords: ['Percentage Calculator', 'Calculate percentage change', 'What is percentage increase', 'Find ratio percentage', 'Percentage growth online'],
    icon: 'Percent',
    howToUse: [
      'For Value calculation: Enter percentage X and total value Y.',
      'For Ratio: Enter numerator X and denominator Y to find the percentage.',
      'For Change: Enter initial value X and target value Y to find percentage increase or decrease.'
    ],
    faqs: [
      {
        question: 'How do you calculate a basic percentage?',
        answer: 'A percentage is a fraction out of 100. To find X% of Y, the formula is: (X × Y) / 100.'
      },
      {
        question: 'How do you calculate percentage change?',
        answer: 'Subtract the old value from the new value, divide the difference by the old value, and multiply the result by 100.'
      }
    ],
    sections: [
      {
        title: 'The Practical Importance of Percentages',
        content: 'Percentages are used daily for calculating discounts in stores, comparing quarterly company returns, estimating salary hikes, and calculating interest rates on loans.'
      }
    ]
  },
  {
    id: 'GPACalculator',
    slug: 'gpa-calculator',
    name: 'GPA Calculator',
    category: 'student',
    shortDescription: 'Calculate your semester GPA (SGPA) and cumulative CGPA based on course grades and credits.',
    metaDescription: 'Free online GPA and CGPA Calculator. Calculate semester grades, select O/A/B/C/D grade points, and compute weighted averages.',
    keywords: ['GPA Calculator', 'CGPA Calculator online', 'Semester grades estimator', 'Credits weightage calculator', 'College GPA tracker'],
    icon: 'GraduationCap',
    howToUse: [
      'Add your courses and input their names, letter grades, and credits.',
      'View your computed SGPA instantly on the results panel.',
      'To find cumulative CGPA, enter your previous cumulative GPA and total earned credits.',
      'Check the total credits and weighted grade average summaries.'
    ],
    faqs: [
      {
        question: 'What grading system is used here?',
        answer: 'It uses the standard Indian university scale (O = 10, A+ = 9, A = 8, B+ = 7, B = 6, C = 5, D = 4, F = 0).'
      },
      {
        question: 'How is GPA calculated?',
        answer: 'GPA is the sum of (Grade Points * Credits) divided by the total number of Credits in the semester.'
      }
    ],
    sections: [
      {
        title: 'Weighted Average Calculations',
        content: 'Calculators use weighted credits to reward higher-stakes courses (like main subjects vs labs). A high grade in a 4-credit course raises your GPA much more than a high grade in a 1-credit lab.'
      }
    ]
  },
  {
    id: 'EquationSolver',
    slug: 'equation-solver',
    name: 'Equation Solver',
    category: 'math-studio',
    shortDescription: 'Solve linear, quadratic, and simultaneous equations with step-by-step solutions.',
    metaTitle: 'Equation Solver Online — Linear, Quadratic, Cubic & Simultaneous Systems',
    metaDescription: 'Free online equation solver with step-by-step solutions. Solve linear, quadratic (formula, vertex & factoring), cubic (Cardano reduction), 2×2 & 3×3 simultaneous systems, and non-linear roots with exact fractions & interactive Cartesian graphs.',
    keywords: [
      'equation solver',
      'solve quadratic equation step by step',
      'cubic equation solver cardano',
      'solve simultaneous equations online',
      'linear equation solver',
      'cramer rule calculator',
      'newton raphson calculator',
      'quadratic formula calculator',
      'system of 3 linear equations solver',
      'step by step math solver',
      'polynomial root finder'
    ],
    icon: 'Binary',
    howToUse: [
      'Select the equation category: Linear (ax + b = c), Quadratic (ax² + bx + c = 0), Cubic (ax³ + bx² + cx + d = 0), 2×2 Simultaneous System, 3×3 Simultaneous System, or Non-Linear (Newton-Raphson f(x) = 0).',
      'Enter the numeric coefficients or function expression in the input fields, or click one of the pre-configured presets (Real Roots, Complex Conjugates, Perfect Squares, Cardano Cubics, Kepler Equations).',
      'Toggle between Decimal and Exact Rational Fraction (a/b) output formats.',
      'Inspect the computed roots, vertex coordinates, discriminant (Δ), and interactive Cartesian graph with root markers.',
      'Review the step-by-step algebraic proof breakdown and export the complete solution as a CSV file.'
    ],
    faqs: [
      {
        question: 'How does the quadratic formula solve ax² + bx + c = 0?',
        answer: 'The quadratic formula x = (-b ± √(b² - 4ac)) / (2a) solves any second-degree polynomial. The discriminant Δ = b² - 4ac determines the root nature: if Δ > 0, there are two distinct real roots; if Δ = 0, there is exactly one real double root (the parabola touches the x-axis at its vertex); if Δ < 0, there are two complex conjugate roots (x = -b/2a ± i√(4ac - b²)/2a).'
      },
      {
        question: 'What is Cardano’s method for solving cubic equations?',
        answer: 'Cardano’s method solves general cubic equations ax³ + bx² + cx + d = 0 by substituting x = t - b/(3a) to eliminate the quadratic term, producing the depressed cubic t³ + pt + q = 0. Depending on the cubic discriminant Δ = (q/2)² + (p/3)³, the equation yields one real root and two complex conjugate roots (Δ > 0) or three distinct real roots via trigonometric substitution (Δ < 0).'
      },
      {
        question: 'How are 2×2 and 3×3 simultaneous systems solved?',
        answer: 'The solver applies Cramer’s Rule using determinants. For 2×2 systems: D = a₁b₂ - a₂b₁, D_x = c₁b₂ - c₂b₁, D_y = a₁c₂ - a₂c₁. If D ≠ 0, the unique intersection is x = D_x/D and y = D_y/D. For 3×3 systems, matrix inversion and 3×3 determinants find the intersection vector (x, y, z).'
      },
      {
        question: 'How does the Newton-Raphson non-linear root finder work?',
        answer: 'The Newton-Raphson method is an iterative numerical algorithm that finds roots of arbitrary differentiable functions f(x) = 0 using tangent line approximations: x_{k+1} = x_k - f(x_k) / f’(x_k). The solver displays an iteration table showing convergence until tolerance < 10⁻⁸ is reached.'
      },
      {
        question: 'Can this solver handle equations with no solution or infinite solutions?',
        answer: 'Yes. For linear equations, 0x = 0 indicates an identity with infinitely many solutions, while 0x = c (c ≠ 0) indicates a contradiction with no solution. For simultaneous systems, D = 0 with zero numerator determinants indicates coincident lines (infinite solutions), while non-zero numerators indicate parallel lines (no solution).'
      },
      {
        question: 'What information does the parabola vertex provide in quadratic equations?',
        answer: 'The vertex (h, k) = (-b/(2a), c - b²/(4a)) represents the global minimum (if a > 0) or global maximum (if a < 0) of the quadratic curve, defining the line of symmetry x = h and the range of the quadratic function.'
      }
    ],
    sections: [
      {
        title: 'Algebraic Foundations: From Linear Relations to Higher Polynomials',
        content: 'Algebraic equations model physical trajectories, economic break-even thresholds, circuit node voltages, and optimization bounds. The Fundamental Theorem of Algebra guarantees that every n-th degree polynomial has exactly n complex roots, providing complete predictability in mathematical physics.'
      },
      {
        title: 'Geometric Duality: Visualizing Algebraic Roots on the Coordinate Plane',
        content: 'Every algebraic root corresponds to a geometric x-intercept where the function curve crosses the horizontal axis (f(x) = 0). Linear equations form straight lines, quadratics form parabolas with focal points, and cubics form S-shaped curves with inflection points.'
      }
    ]
  },
  {
    id: 'MatrixCalculator',
    slug: 'matrix-calculator',
    name: 'Matrix Calculator',
    category: 'math-studio',
    shortDescription: 'Perform matrix arithmetic, find determinants, inverses, rank, and transposes.',
    metaTitle: 'Matrix Calculator Online — Multi-Dimension Algebra, RREF, Determinants & Eigenvalues',
    metaDescription: 'Free online matrix calculator for M×N linear algebra. Calculate matrix multiplication, inverses, determinants, rank-nullity, eigenvalues, RREF Gauss-Jordan, and linear systems Ax=b with exact fractions and step-by-step derivations.',
    keywords: [
      'matrix calculator',
      'matrix multiplication online',
      'matrix inverse calculator',
      'calculate matrix rank',
      'determinant calculator',
      'rref calculator',
      'gauss jordan elimination step by step',
      'eigenvalue calculator',
      'linear system solver ax=b',
      'lu decomposition online',
      'cholesky decomposition calculator',
      'hadamard product calculator',
      'kronecker product matrix'
    ],
    icon: 'Grid',
    howToUse: [
      'Select your calculation mode: Arithmetic (A+B, A×B, Hadamard, Kronecker), Properties (det, A⁻¹, rank, trace, powers), Decompositions (RREF, Eigenvalues, LU, QR, Cholesky), Linear Systems (Ax=b), or 2D Transformation Visualizer.',
      'Configure Matrix A and Matrix B dimensions from 1×1 up to 6×6 using the row and column selectors, or load a preset (Identity, Symmetric, 2D Rotation, Hilbert, Markov).',
      'Enter numeric coefficients or fractions into the matrix input cells.',
      'Toggle between Decimal and Exact Rational Fraction (a/b) display modes.',
      'Inspect the computed solution matrix, scalar values, 2D geometric transformation canvas, and step-by-step Gaussian derivations.',
      'Export the resulting matrix as a CSV file or copy polyglot code in LaTeX, Python (NumPy), MATLAB/Octave, or JSON array format.'
    ],
    faqs: [
      {
        question: 'What is a matrix determinant and why is it important?',
        answer: 'The determinant (det A or |A|) is a scalar value calculated exclusively for square matrices (n×n). Geometrically, it represents the scaling factor of the transformation on volume or area (e.g., in 2D it is the signed area of the transformed unit square). Algebraically, a matrix is invertible if and only if its determinant is non-zero (det A ≠ 0). A determinant of zero indicates a singular, rank-deficient matrix whose columns are linearly dependent.'
      },
      {
        question: 'What is the condition for matrix multiplication A × B?',
        answer: 'Two matrices A (m×n) and B (p×q) can be multiplied (A × B) if and only if the number of columns in A equals the number of rows in B (n = p). The resulting product matrix C has dimension m×q, where each entry C[i][j] is the dot product of row i from A and column j from B.'
      },
      {
        question: 'What is Reduced Row Echelon Form (RREF) and Gauss-Jordan elimination?',
        answer: 'Reduced Row Echelon Form (RREF) is the unique canonical form of a matrix obtained via elementary row operations (row swapping, row scaling, and row addition). In RREF, the leading entry (pivot) of every non-zero row is 1, each pivot is strictly to the right of the pivot in the row above, all entries in pivot columns other than the pivot itself are 0, and all rows consisting entirely of zeros are at the bottom. RREF is used to determine matrix rank, find bases for column and null spaces, and solve systems of linear equations.'
      },
      {
        question: 'What does the Rank-Nullity Theorem state?',
        answer: 'For any m×n matrix representing a linear map from an n-dimensional vector space, the Rank-Nullity Theorem states that rank(A) + nullity(A) = n (the number of columns). The rank is the dimension of the column space (image/range), while the nullity is the dimension of the null space (kernel, solutions to Ax = 0).'
      },
      {
        question: 'What are eigenvalues and eigenvectors in linear algebra?',
        answer: 'Given a square matrix A, a non-zero vector v is an eigenvector and λ is its corresponding eigenvalue if Av = λv. This means the linear transformation A acts on v purely by scaling it by a factor of λ without changing its spatial direction. Eigenvalues are calculated by finding the roots of the characteristic polynomial det(A - λI) = 0.'
      },
      {
        question: 'How does this calculator solve linear systems of equations (Ax = b)?',
        answer: 'The calculator constructs the augmented matrix [A | b] and performs Gauss-Jordan elimination into RREF. According to the Rouché–Capelli theorem: if rank(A) < rank([A|b]), the system is inconsistent (no solution); if rank(A) = rank([A|b]) = n, the system has a unique solution vector; if rank(A) = rank([A|b]) < n, there are infinitely many solutions parameterized by n - rank(A) free variables.'
      }
    ],
    sections: [
      {
        title: 'Matrix Algebra, Spatial Transformations & Linear Systems',
        content: 'Matrices are the bedrock of computational mathematics, artificial intelligence, computer graphics, structural mechanics, quantum physics, and economic modeling. A matrix represents a linear transformation between vector spaces, encoding rotations, scalings, shears, projections, and coordinate changes.'
      },
      {
        title: 'Matrix Decompositions & Modern Numerical Linear Algebra',
        content: 'Matrix factorizations allow decomposing complex operators into simpler, computationally efficient components. LU Decomposition (A = LU) accelerates solving multiple linear systems with identical coefficients. QR Decomposition (A = QR) produces an orthogonal matrix Q and upper-triangular matrix R for stable least-squares regression. Cholesky Decomposition (A = LLᵀ) provides an ultra-fast square-root factorization for symmetric positive-definite covariance and stiffness matrices.'
      }
    ]
  },
  {
    id: 'StatisticsCalculator',
    slug: 'statistics-calculator',
    name: 'Statistics Calculator',
    category: 'math-studio',
    shortDescription: 'Compute mean, median, mode, standard deviation, variance, and plot box/histogram charts.',
    metaTitle: 'Statistics Calculator | Mean, Median, Mode, Std Dev & Box Plots',
    metaDescription: 'Free online Statistics Calculator. Compute mean, median, mode, sample/population standard deviation, variance, quartiles, Tukey outliers, and generate interactive SVG histograms and box plots in real time.',
    keywords: [
      'statistics calculator',
      'descriptive statistics calculator',
      'mean median mode calculator',
      'standard deviation calculator',
      'sample variance calculator',
      'population variance calculator',
      'box plot generator',
      'interquartile range IQR calculator',
      'tukey outlier detection',
      'z score calculator',
      'frequency distribution table generator',
      'kurtosis and skewness calculator'
    ],
    icon: 'BarChart3',
    howToUse: [
      'Enter or paste your numerical dataset into the input field (delimited by commas, spaces, semicolons, tabs, or newlines), upload a CSV/TXT data file, or select a pre-loaded sample dataset (Exam Scores, Server Latency, Stock Returns, Quality Control, or Income Distribution).',
      'Choose between Sample Statistics (n - 1 degrees of freedom with Bessel\'s correction) or Population Statistics (N degrees of freedom) depending on whether your data represents an experimental sample or a full census.',
      'Explore the Comprehensive Metrics Grid: View Central Tendency (Arithmetic Mean, Median, Mode, Midrange, Trimmed Mean, Geometric Mean, Harmonic Mean), Dispersion (Variance, Standard Deviation, Standard Error SEM, Range, MAD, CV%), and 95% Confidence Intervals.',
      'Inspect the Interactive SVG Visualization Studio: Switch between the Frequency Distribution Histogram (with customizable bin counts and Gaussian Bell Curve overlay) and the Box-and-Whisker Plot (featuring the five-number summary and highlighted Tukey outlier points).',
      'Use the Interactive Z-Score & Percentile Probe: Enter any single value (X) to instantly calculate its standardized Z-score, theoretical standard normal percentile, and empirical rank within your dataset.',
      'Export or Share Your Analysis: Copy the fully formatted plaintext statistical report to your clipboard, export data to a CSV spreadsheet with individual Z-scores, or generate synthetic distribution samples (Normal, Uniform, Exponential, Bimodal) for hypothesis testing.'
    ],
    faqs: [
      {
        "question": "How do you calculate Mean, Median, and Mode, and when should each be used?",
        "answer": "The Arithmetic Mean (x̄ = Σx / n) is the mathematical balance point, ideal for symmetric distributions without extreme anomalies. The Median (Q2) is the middle value of an ordered dataset, robust against extreme outliers and preferred for skewed distributions (such as household income or server latency). The Mode is the most frequently occurring value, useful for categorical or discrete count data. If Mean = Median = Mode, the distribution is perfectly symmetrical."
      },
      {
        "question": "What is the difference between Sample Standard Deviation (s) and Population Standard Deviation (σ)?",
        "answer": "Sample standard deviation uses Bessel's correction by dividing the sum of squared deviations by (n - 1) instead of n (s = √(Σ(x - x̄)² / (n - 1))). This correction eliminates the systematic negative bias in sample variance, providing an exact, mathematically unbiased estimator for the true population variance. Population standard deviation (σ = √(Σ(x - μ)² / N)) divides by N and should only be used when the dataset comprises 100% of all possible observations in a closed population."
      },
      {
        "question": "How is the Five-Number Summary constructed and displayed in a Box Plot?",
        "answer": "The Five-Number Summary consists of: (1) Minimum (lowest non-outlier value), (2) First Quartile Q1 (25th percentile), (3) Median Q2 (50th percentile), (4) Third Quartile Q3 (75th percentile), and (5) Maximum (highest non-outlier value). The Box-and-Whisker plot renders a central box spanning from Q1 to Q3 (representing the Interquartile Range, IQR), a midline at the Median, and whiskers extending to the extreme values within 1.5 × IQR fences."
      },
      {
        "question": "How does the 1.5 × IQR Tukey Fence rule detect Mild and Extreme Outliers?",
        "answer": "John Tukey's exploratory data analysis method establishes mathematical boundaries (fences) using the Interquartile Range (IQR = Q3 - Q1): Inner Fences are set at [Q1 - 1.5×IQR, Q3 + 1.5×IQR]; points falling beyond inner fences are classified as Mild Outliers. Outer Fences are set at [Q1 - 3.0×IQR, Q3 + 3.0×IQR]; points falling outside outer fences are classified as Extreme Outliers. This non-parametric method requires no assumption of normality."
      },
      {
        "question": "What do Skewness and Excess Kurtosis indicate about dataset distribution shape?",
        "answer": "Skewness quantifies distribution asymmetry: a positive skew (> 0.5) indicates a long right tail (mean > median); a negative skew (< -0.5) indicates a long left tail (mean < median); near zero (-0.5 to 0.5) indicates approximate symmetry. Excess Kurtosis measures tail heaviness relative to a normal distribution: Leptokurtic (> 0.5) has heavy tails and high outlier frequency; Platykurtic (< -0.5) has light tails and uniform flatness; Mesokurtic (near 0) matches standard Gaussian bell-curve kurtosis."
      },
      {
        "question": "How are Z-Scores and Standard Normal percentiles computed?",
        "answer": "A Z-score (standard score) measures how many standard deviations an observation x lies above or below the mean: z = (x - x̄) / s. A Z-score of 0 represents the mean, +1.0 represents one standard deviation above, and -2.0 represents two standard deviations below. Using the cumulative standard normal distribution function Φ(z), the calculator converts any Z-score into a cumulative percentile (e.g. z = +1.96 corresponds to the 97.5th percentile)."
      },
      {
        "question": "Does this statistics calculator upload or store my dataset on external servers?",
        "answer": "No. All statistical computations, sorting algorithms, outlier evaluations, and SVG diagram renderings execute 100% locally in your web browser memory (RAM). Zero data packets are sent across the network, ensuring strict institutional compliance for proprietary financial, medical, and academic datasets."
      }
    ],
    sections: [
      {
        "title": "Descriptive Statistics Overview & Measures of Central Tendency",
        "content": "Descriptive statistics synthesize raw numerical observations into meaningful summaries that describe the center, spread, and shape of a distribution.\n\n1. Measures of Central Tendency:\n- Arithmetic Mean (x̄): x̄ = (1/n) Σ xᵢ. The standard average and center of gravity for balanced distributions.\n- Median (Q2): The 50th percentile value dividing sorted observations in half. Robust against extreme outliers.\n- Mode: The value(s) with highest occurrence frequency. Can be unimodal, bimodal, multimodal, or non-existent.\n- Midrange: (Min + Max) / 2. A quick estimate of the midpoint between extrema.\n- Trimmed Mean (10%): Mean computed after discarding top 5% and bottom 5% of extreme values to reduce outlier distortion.\n- Geometric Mean: (∏ xᵢ)^(1/n). The multiplicative mean for exponential growth rates, compound interest, and normalized index factors (valid for positive numbers).\n- Harmonic Mean: n / Σ(1/xᵢ). The reciprocal mean for rates, ratios, and speed/distance computations.\n\n2. Selecting the Best Central Tendency Metric:\n- Symmetrical Data (Normal Distribution): Arithmetic Mean is most statistically efficient.\n- Skewed / Heavy-Tailed Data (Income, Web Traffic, House Prices): Median provides a more reliable measure of typical central values.\n- Categorical or Grouped Bins: Mode highlights the most popular cluster."
      },
      {
        "title": "Measures of Dispersion, Variability & Bessel's Correction",
        "content": "Measures of dispersion quantify the degree of spread, scatter, and variability among data points around the central value.\n\n1. Mathematical Formulas for Spread:\n- Sample Variance (s²): s² = Σ(xᵢ - x̄)² / (n - 1). Employs Bessel's correction (n - 1 degrees of freedom) to ensure that the sample variance estimator has an expected value exactly equal to the true population variance.\n- Population Variance (σ²): σ² = Σ(xᵢ - μ)² / N. Used when the dataset contains the exhaustive universe of observations.\n- Standard Deviation (s or σ): The square root of variance, expressed in identical physical units as the original data.\n- Standard Error of the Mean (SEM): SEM = s / √n. Measures the precision with which the sample mean estimates the true population mean.\n- Interquartile Range (IQR): IQR = Q3 - Q1. The middle 50% spread, completely immune to extreme outliers.\n- Range: R = Max - Min. Total spread between extrema.\n- Mean Absolute Deviation (MAD): MAD = (1/n) Σ |xᵢ - x̄|. The average absolute distance of points from the mean.\n- Coefficient of Variation (CV%): CV = (s / x̄) × 100%. A dimensionless relative measure of dispersion, allowing comparison across datasets with different scales."
      },
      {
        "title": "Five-Number Summary, Quartiles & Tukey Outlier Detection",
        "content": "The Five-Number Summary provides an exploratory summary of distribution position without making parametric assumptions:\n\n1. Five-Number Summary Construction:\n- Minimum: Lowest value observed.\n- First Quartile (Q1): 25th percentile (splits bottom 25% from top 75%).\n- Median (Q2): 50th percentile (central balance).\n- Third Quartile (Q3): 75th percentile (splits bottom 75% from top 25%).\n- Maximum: Highest value observed.\n\n2. Tukey IQR Outlier Detection Rules:\n- Interquartile Range: IQR = Q3 - Q1\n- Lower Inner Fence: Q1 - (1.5 × IQR)\n- Upper Inner Fence: Q3 + (1.5 × IQR)\n- Lower Outer Fence: Q1 - (3.0 × IQR)\n- Upper Outer Fence: Q3 + (3.0 × IQR)\n\nValues between Inner and Outer fences are designated Mild Outliers (plotted as open circles on box plots). Values beyond Outer fences are designated Extreme Outliers (plotted as filled markers), signaling severe anomalies or measurement artifacts."
      },
      {
        "title": "Distribution Shape, Skewness, Kurtosis & Z-Score Standardization",
        "content": "Beyond center and spread, higher statistical moments quantify the shape, asymmetry, and tail behavior of datasets:\n\n1. Distribution Asymmetry (Skewness):\n- Fisher-Pearson Skewness (g₁): g₁ = (n / ((n - 1)(n - 2))) Σ ((xᵢ - x̄) / s)³\n- Positive Skew (g₁ > +0.5): Right-skewed distribution with a prolonged right tail and Mean > Median.\n- Negative Skew (g₁ < -0.5): Left-skewed distribution with a prolonged left tail and Mean < Median.\n- Symmetric (g₁ between -0.5 and +0.5): Balanced bell-shaped profile.\n\n2. Tail Heaviness (Excess Kurtosis):\n- Excess Kurtosis (g₂): g₂ = [n(n + 1) / ((n - 1)(n - 2)(n - 3))] Σ ((xᵢ - x̄) / s)⁴ - [3(n - 1)² / ((n - 2)(n - 3))]\n- Leptokurtic (g₂ > +0.5): Fat-tailed distribution prone to extreme outlier events.\n- Platykurtic (g₂ < -0.5): Thin-tailed, flat distribution with low outlier likelihood.\n- Mesokurtic (g₂ ≈ 0): Matches the standard Gaussian normal distribution tail profile.\n\n3. Z-Score Standardization & Empirical Rule:\n- Standard Z-Score: z = (x - x̄) / s\n- Under a Normal Distribution: 68.27% of observations fall within ±1σ (z ∈ [-1, +1]); 95.45% fall within ±2σ (z ∈ [-2, +2]); and 99.73% fall within ±3σ (z ∈ [-3, +3])."
      }
    ]
  },
  {
    id: 'DataAnalysisCalculator',
    slug: 'data-analysis-calculator',
    name: 'Data Analysis Calculator',
    category: 'math-studio',
    shortDescription: 'Analyze tabular data, detect outliers, perform regressions, and plot scatter charts.',
    metaDescription: 'Upload CSV or paste tabular datasets to compute bivariate regressions (linear, polynomial, exponential, power, log), Pearson correlation matrices, Tukey IQR & Z-score outlier detection, and 95% confidence bands.',
    keywords: [
      'data analysis calculator',
      'linear regression calculator',
      'polynomial regression online',
      'outlier detector tool',
      'scatter plot generator',
      'correlation matrix calculator',
      'descriptive statistics calculator',
      'tukey iqr anomaly detector',
      'r squared calculator',
      'bivariate data analyzer'
    ],
    icon: 'TrendingUp',
    howToUse: [
      'Paste your spreadsheet table or upload a CSV/TSV file with auto-detected delimiters.',
      'Select the Independent (X) and Dependent (Y) variables from the dynamic column dropdowns.',
      'Explore the multi-model curve fitting table comparing Linear, Quadratic, Cubic, Exponential, Power, and Logarithmic models with automatic Best Fit identification.',
      'Inspect the interactive SVG scatter plot featuring 95% prediction interval ribbons, residual drop lines, and outlier halo highlights.',
      'Switch between the Descriptive Statistics, Outlier Diagnostics, Correlation Heatmap, What-If Value Predictor, and Data Grid tabs to conduct comprehensive statistical analysis.'
    ],
    faqs: [
      {
        question: 'How does the calculator determine the Best Fitting regression model?',
        answer: 'The calculator evaluates all valid models (Linear, Polynomial Degree 2 & 3, Exponential, Power Law, and Logarithmic) against your dataset by computing the Coefficient of Determination (R²), Adjusted R², and Root Mean Squared Error (RMSE). The model that minimizes residual sum of squares and maximizes R² without overfitting is designated with a Best Fit badge.'
      },
      {
        question: 'How are statistical outliers and anomalies identified?',
        answer: 'Two complementary statistical methodologies are applied: (1) Tukey’s Interquartile Range (IQR) rule, which flags any observation lying beyond the inner fences [Q1 - 1.5×IQR, Q3 + 1.5×IQR], and (2) Standardized Z-Score rule, which flags data points with |z| > 2.0 (mild) or |z| > 3.0 (extreme anomaly). You can also toggle the "Exclude Outliers" switch to recalculate all regression parameters without anomalous points.'
      },
      {
        question: 'What is the difference between Pearson Correlation (r) and R-Squared (R²)?',
        answer: 'Pearson correlation coefficient (r) ranges from -1.0 to +1.0 and measures both the strength and direction of a linear relationship between two continuous variables. The coefficient of determination (R² = r² in simple linear regression) ranges from 0% to 100% and quantifies the exact proportion of variance in the dependent variable that is predictable from the independent variable.'
      },
      {
        question: 'What does the 95% Confidence / Prediction Interval ribbon represent on the scatter chart?',
        answer: 'The shaded confidence ribbon around the regression line depicts the range within which 95% of future individual observations are statistically expected to fall, taking into account sample variance, sample size (N), and distance from the centroid mean (x̄).'
      },
      {
        question: 'How does the What-If Value Predictor work?',
        answer: 'The What-If Predictor uses the active regression model to provide forward estimations (entering X to forecast Ŷ) and inverse calculations (entering target Y to calculate required X) with high precision.'
      },
      {
        question: 'Can I analyze multi-variable datasets with more than two columns?',
        answer: 'Yes. The Correlation Matrix tab generates an interactive N×N heatmap visualizing pairwise Pearson correlations across all numeric columns, while the Descriptive Statistics tab computes full five-number summaries, skewness, kurtosis, and confidence intervals for any selected dimension.'
      }
    ],
    sections: [
      {
        title: 'Bivariate Regression Analysis & Mathematical Models',
        content: 'Regression analysis estimates mathematical relationships between dependent and explanatory variables. Simple linear regression minimizes the sum of squared residuals (Ordinary Least Squares - OLS), while polynomial, exponential, and power models capture nonlinear growth, diminishing returns, and power-law distributions across financial, biological, and engineering datasets.'
      },
      {
        title: 'Univariate Statistics & Distribution Measures',
        content: 'Descriptive statistics provide complete numerical characterizations of data spread. Central tendency metrics (mean, median, trimmed mean) indicate the location of the center, while dispersion metrics (variance, sample standard deviation, IQR, coefficient of variation) quantify dispersion. Higher-order moments like skewness and excess kurtosis diagnose tail heaviness and asymmetric distortions relative to Gaussian normal distributions.'
      }
    ]
  },
  {
    id: 'UnitConverterPro',
    slug: 'unit-converter-pro',
    name: 'Unit Converter Pro',
    category: 'math-studio',
    shortDescription: 'Convert length, area, volume, pressure, speed, torque, density, and 10+ other dimensions.',
    metaDescription: 'High precision online unit converter. Convert length, volume, force, pressure, torque, energy, speed, density, and data storage easily.',
    keywords: ['unit converter', 'pressure converter', 'torque conversion', 'density converter', 'engineering unit conversion'],
    icon: 'Scale',
    howToUse: [
      'Select the conversion dimension (e.g. Length, Pressure, Torque, Volume).',
      'Input the value and select the source and target units from the searchable lists.',
      'Toggle unit directions using the swap button.',
      'Manage your favorite unit pairs and review recent conversions saved in your local history.'
    ],
    faqs: [
      {
        question: 'Which engineering units are supported?',
        answer: 'This converter supports 16 physical dimensions including technical units like Pascals, PSI, Newton-meters, foot-pounds, speed, volume, and computer data storage bytes.'
      },
      {
        question: 'Can I save units I use frequently?',
        answer: 'Yes. You can click the star next to any unit pair to save it as a favorite in your LocalStorage, making it instantly accessible when you load the converter.'
      }
    ],
    sections: [
      {
        title: 'The Importance of Precise Conversions',
        content: 'Engineering design requires transferring values between metric and imperial dimensions. Simple rounding errors in torque, pressure, or density conversions can compromise structural integrity. This tool supports floating-point precision adjustments to satisfy professional requirements.'
      }
    ]
  },
  {
    id: 'GeometrySolver',
    slug: 'geometry-solver',
    name: 'Geometry Solver',
    category: 'math-studio',
    shortDescription: 'Solve triangles (SSS, SAS, ASA, AAS), polygons, circles, and coordinate metrics.',
    metaDescription: 'Solve 2D geometry shapes. Compute side-lengths, interior angles, perimeters, and areas for triangles, circles, and polygons with dynamic SVG diagrams.',
    keywords: ['geometry solver', 'triangle solver SSS', 'circle calculator area', 'polygon solver', 'solve triangle SAS'],
    icon: 'Compass',
    howToUse: [
      'Select the geometry shape: Triangle, Circle, Rectangle, Trapezoid, or Regular Polygon.',
      'Choose the input criteria (for triangles: SSS, SAS, ASA, or AAS).',
      'Enter the known dimensions in the input forms.',
      'Inspect the solved angles, missing sides, formulas, and the dynamically rendered SVG diagram.'
    ],
    faqs: [
      {
        question: 'What is SSS, SAS, ASA, and AAS?',
        answer: 'These terms refer to the known dimensions of a triangle: Side-Side-Side, Side-Angle-Side, Angle-Side-Angle, and Angle-Angle-Side. They represent the minimum constraints required to solve a triangle uniquely.'
      },
      {
        question: 'How are the SVG diagrams generated?',
        answer: 'The diagrams are computed client-side using coordinate geometry to map the solved coordinates, rendering a scaled vector representation matching your values.'
      }
    ],
    sections: [
      {
        title: 'Trigonometry & Spatial Mathematics',
        content: 'Solving triangles relies on basic trigonometric relations like the Law of Sines and the Law of Cosines. Polygons and trapezoids are resolved by decomposing them into triangles and applying coordinate matrices to extract surface areas and boundary perimeters.'
      }
    ]
  },
  {
    id: 'VolumeCalculator3D',
    slug: '3d-geometry-volume-calculator',
    name: '3D Geometry & Volume Calculator',
    category: 'math-studio',
    shortDescription: 'Calculate volume, surface area, and capacity in litres for cylinders, cones, and spheres.',
    metaTitle: '3D Geometry & Volume Calculator Online — Cylinders, Cones, Tanks & Prisms',
    metaDescription: 'Free online 3D geometry and volume calculator. Compute volume, surface area, capacity in litres & gallons, and material weight for 19 shapes including cylinders, cones, spheres, frustums, prisms, and horizontal liquid dipstick tanks.',
    keywords: [
      'volume calculator',
      'cylinder volume calculator',
      'cone surface area calculator',
      'sphere volume calculator',
      'tank capacity litres calculator',
      'pipe volume calculator',
      'frustum volume formula',
      'torus volume calculator',
      'ellipsoid surface area',
      'triangular prism volume',
      'hexagonal prism volume',
      'horizontal tank dipstick calculator',
      'material weight from volume'
    ],
    icon: 'Box',
    howToUse: [
      'Select a solid geometry category (Curved Solids, Prisms & Cubes, Pyramids, or Tanks & Silos) and choose from 19 shapes including Cylinders, Cones, Spheres, Frustums, Torus, Cuboids, and Horizontal Cylindrical Tanks.',
      'Select your preferred measurement unit: Meters (m), Centimeters (cm), Millimeters (mm), Feet (ft), Inches (in), or Yards (yd).',
      'Enter the dimensional parameters (radii, heights, lengths, widths). For horizontal tanks, adjust the interactive dipstick liquid depth slider.',
      'Select a solid or liquid material (Water, Concrete, Steel, Aluminum, Timber, PLA/PETG, Soil, Gasoline) to automatically calculate net physical mass in kg, tonnes, and lbs.',
      'Inspect the computed 3D wireframe preview, SI volume (m³), holding capacity (Litres, US Gallons, UK Gallons, ft³, bbl), and total surface area.',
      'Review the step-by-step geometric derivations and export the complete volumetric specification as a CSV file.'
    ],
    faqs: [
      {
        question: 'How do you calculate the volume and capacity of a cylinder?',
        answer: 'The volume of a cylinder is calculated using the formula V = π × r² × h, where r is the base radius and h is the height. To convert volume to liquid capacity: 1 cubic meter (m³) equals 1,000 Litres or approximately 264.172 US liquid gallons. Total surface area is given by A = 2πr(r + h).'
      },
      {
        question: 'What is a frustum and how is its volume computed?',
        answer: 'A frustum is a truncated cone (or pyramid) formed by cutting off the apex with a plane parallel to the base. The volume of a conical frustum with top radius r, bottom radius R, and vertical height h is V = (1/3) × π × h × (R² + r² + R×r). Its slant height is s = √((R - r)² + h²).'
      },
      {
        question: 'How is the liquid volume calculated in a partially filled horizontal cylindrical tank?',
        answer: 'For a horizontal cylinder of radius R and length L filled to depth h (h ≤ 2R), the cross-sectional liquid area is a circular segment: A_seg = R² × arccos((R - h)/R) - (R - h) × √(2Rh - h²). The total liquid volume is V_liquid = A_seg × L. This calculator computes exact dipstick liquid holding volumes and ullage (empty headspace).'
      },
      {
        question: 'What is Cavalieri’s Principle in 3D geometry?',
        answer: 'Cavalieri’s Principle states that if two three-dimensional solids have the same height and equal cross-sectional areas at every level parallel to their bases, their total volumes are equal. This fundamental theorem proves why right prisms/cylinders and oblique prisms/cylinders of identical base and height share the exact same volume formula.'
      },
      {
        question: 'How do you calculate the mass/weight of a 3D solid from its volume?',
        answer: 'The mass is calculated using the physical density relationship: Mass (kg) = Volume (m³) × Density (kg/m³). For example, a 2 m³ solid block made of reinforced concrete (density ~2,400 kg/m³) weighs 4,800 kg (4.8 metric tonnes).'
      },
      {
        question: 'What is the difference between total surface area and lateral surface area?',
        answer: 'Lateral Surface Area (LSA) measures only the area of the curved sides or perimeter faces excluding the top and bottom bases. Total Surface Area (TSA) includes the lateral area plus the area of all bases (e.g., for a cylinder, TSA = 2πrh + 2πr²).'
      }
    ],
    sections: [
      {
        title: 'Volumetric & Spatial Geometry in Engineering and Science',
        content: 'Volumetric calculations govern fluid storage design (chemical sumps, water reservoirs, pressurized silos), civil construction budgeting (concrete batch volumes, excavation soil tonnage), thermal heat exchange (surface-area-to-volume ratio), and logistics cargo containerization.'
      },
      {
        title: 'Liquid Storage Tanks, Dipstick Calibration & Ullage',
        content: 'Industrial tanks storing petroleum, milk, or chemicals require nonlinear dipstick volume charts because cylindrical cross-sections expand and contract nonlinearly with liquid depth. Our calculator provides instantaneous circular segment integration to accurately calibrate liquid inventories.'
      }
    ]
  },
  {
    id: 'ProbabilityCalculator',
    slug: 'probability-calculator',
    name: 'Probability Calculator',
    category: 'math-studio',
    shortDescription: 'Compute combinations, permutations, binomials, and normal distribution graphs.',
    metaDescription: 'Calculate permutations, combinations, binomial probability density, normal distribution Z-scores, and sample size margins with interactive graphs.',
    keywords: ['probability calculator', 'permutations combinations', 'binomial probability calculator', 'z score normal distribution', 'sample size calculator'],
    icon: 'Activity',
    howToUse: [
      'Select the probability module: Combinations/Permutations, Binomial distribution, or Normal distribution.',
      'Enter the inputs (number of trials, success probabilities, bounds).',
      'Review the computed outcome and mathematical probability formulas.',
      'Examine the interactive distribution curve plot showing standard deviations and z-scores.'
    ],
    faqs: [
      {
        question: 'What is the difference between permutation and combination?',
        answer: 'Permutations account for the order of selection (e.g. arranging medals), while combinations ignore the order (e.g. selecting a committee).'
      },
      {
        question: 'What does a Z-score represent?',
        answer: 'A Z-score indicates how many standard deviations an observation is from the mean of a normal distribution. It normalizes datasets to determine probability densities.'
      }
    ],
    sections: [
      {
        title: 'Statistical Probability Slabs',
        content: 'Probability distributions describe the likelihood of outcomes in random events. The binomial distribution represents discrete scenarios (e.g. coin flips), while the normal distribution describes continuous natural variations (e.g. component tolerances, test marks).'
      }
    ]
  },
  {
    id: 'CoordinateGeometryCalculator',
    slug: 'coordinate-geometry-calculator',
    name: 'Coordinate Geometry Calculator',
    category: 'math-studio',
    shortDescription: 'Compute distance, midpoint, slope, line equation, and plot line segments.',
    metaDescription: 'Free online coordinate geometry calculator. Solve distance between points, midpoint, slope, line formulas, and circles with SVG coordinate graphs.',
    keywords: ['coordinate geometry calculator', 'distance formula points', 'midpoint calculator', 'slope of a line', 'circle equation coordinate'],
    icon: 'LineChart',
    howToUse: [
      'Enter the coordinates of your points (X1, Y1) and (X2, Y2).',
      'Select the coordinate metrics: Distance, Midpoint, Slope, Line Equation, or Point-to-Line clearances.',
      'Review formulas, step-by-step Cartesian calculations, and intercepts.',
      'Inspect the generated SVG coordinate grid showing points, lines, and midpoints plotted dynamically.'
    ],
    faqs: [
      {
        question: 'How is the point-to-line distance calculated?',
        answer: 'It uses the perpendicular distance formula: d = |A*x0 + B*y0 + C| / √(A² + B²), where Ax + By + C = 0 is the line equation and (x0, y0) is the point.'
      },
      {
        question: 'What coordinate formats are supported?',
        answer: 'The calculator handles positive, negative, and fractional coordinate points, automatically centering the SVG graph to fit the bounding box of the points.'
      }
    ],
    sections: [
      {
        title: 'Cartesian Coordinate System principles',
        content: 'Coordinate geometry connects algebra and geometry. By mapping points onto a Cartesian plane, geometric curves are expressed as algebraic equations, allowing automated pathing, structural modeling, and spatial clearance analysis.'
      }
    ]
  },
  {
    id: 'DerivativeCalculator',
    slug: 'derivative-calculator',
    name: 'Derivative Calculator with Steps',
    category: 'math-studio',
    shortDescription: 'Solve first, second, and higher-order derivatives symbolically with step-by-step differentiation rules, tangent lines, and interactive function graphs.',
    metaDescription: 'Free online derivative calculator with steps. Solve derivatives symbolically using power, product, quotient, and chain rules. Evaluates slopes, tangent line equations, and higher-order derivatives with graphs.',
    keywords: [
      'derivative calculator',
      'derivative calculator with steps',
      'symbolic differentiation solver',
      'calculus derivative solver',
      'first derivative calculator',
      'second derivative calculator',
      'chain rule calculator',
      'product rule calculator',
      'quotient rule calculator',
      'tangent line calculator',
      'derivative at a point',
      'differentiation rules table',
      'instantaneous rate of change',
      'd/dx solver',
      'step by step derivative'
    ],
    icon: 'Activity',
    howToUse: [
      'Enter any single-variable mathematical function (e.g. x^3 - 3*x^2 + 2*x, sin(x)*cos(x), e^(2*x), (x^2+1)/(x-1)).',
      'Specify the differentiation variable (default is x).',
      'Select the derivative order (1st derivative d/dx, 2nd derivative d²/dx², 3rd derivative d³/dx³, or 4th derivative d⁴/dx⁴).',
      'Optionally input an evaluation point x = a to compute the slope, tangent line equation y = mx + b, normal line equation, and concavity.',
      'Review the step-by-step differentiation breakdown, symbolic result, LaTeX output, and interactive multi-curve overlay graph.'
    ],
    faqs: [
      {
        question: 'What is a derivative in calculus?',
        answer: 'A derivative measures the instantaneous rate of change of a function f(x) with respect to x. Geometrically, it equals the slope of the tangent line to the function\'s graph at any point (x, f(x)). Mathematically, it is defined by the limit: f\'(x) = lim(h->0) [f(x+h) - f(x)] / h.'
      },
      {
        question: 'What are the core differentiation rules used by this calculator?',
        answer: 'This solver applies standard analytical calculus rules: (1) Power Rule: d/dx[xⁿ] = n·xⁿ⁻¹; (2) Constant Multiple Rule: d/dx[c·f(x)] = c·f\'(x); (3) Sum/Difference Rule: d/dx[f ± g] = f\' ± g\'; (4) Product Rule: d/dx[u·v] = u\'v + uv\'; (5) Quotient Rule: d/dx[u/v] = (u\'v - uv\')/v²; (6) Chain Rule: d/dx[f(g(x))] = f\'(g(x))·g\'(x); (7) Exponential Rule: d/dx[eˣ] = eˣ; and (8) Trigonometric Rules: d/dx[sin x] = cos x, d/dx[cos x] = -sin x, d/dx[tan x] = sec²x.'
      },
      {
        question: 'How do you find the equation of a tangent line using derivatives?',
        answer: 'To find the tangent line at x = a: (1) Compute y₀ = f(a) to get the point of tangency (a, y₀); (2) Evaluate the first derivative m = f\'(a) to determine the tangent slope; (3) Substitute into point-slope form: y - y₀ = m(x - a) to obtain the slope-intercept equation: y = m·x + (y₀ - m·a).'
      },
      {
        question: 'What does the second derivative f\'\'(x) represent?',
        answer: 'The second derivative represents the rate of change of the slope (acceleration and curvature). If f\'\'(a) > 0, the graph is concave upward (U-shaped, indicating a local minimum candidate). If f\'\'(a) < 0, the graph is concave downward (∩-shaped, indicating a local maximum candidate). If f\'\'(a) = 0 and changes sign, it identifies an inflection point.'
      },
      {
        question: 'Does this derivative calculator solve higher-order derivatives?',
        answer: 'Yes. You can compute first (f\'), second (f\'\'), third (f\'\'\'), and fourth (f⁴) derivatives symbolically by selecting the desired derivative order from the dropdown.'
      },
      {
        question: 'How are trigonometric, exponential, and logarithmic functions formatted?',
        answer: 'Use standard notation: sin(x), cos(x), tan(x), exp(x) or e^x for natural exponential, and log(x) or ln(x) for natural logarithm. For powers of trigonometric functions like sin²(x), write (sin(x))^2 or sin(x)^2.'
      },
      {
        question: 'Can I copy the solution in LaTeX format for homework or scientific papers?',
        answer: 'Yes. The calculator includes a 1-click \'Copy LaTeX\' button that generates clean KaTeX/LaTeX formatting (e.g. \\frac{d}{dx}[f(x)] = f\'(x)) ready to paste into Overleaf, LaTeX documents, or Markdown notes.'
      },
      {
        question: 'Is this derivative solver free and calculated client-side?',
        answer: 'Yes. All symbolic derivations and graph evaluations run 100% locally in your browser using secure client-side computation sandboxes, meaning your expressions are never stored or logged on external servers.'
      }
    ],
    sections: [
      {
        title: 'Master Table of Calculus Differentiation Rules',
        content: 'Calculus derivatives follow precise algebraic rules depending on the structural composition of the mathematical function:\n\n' +
          '• Constant Rule: d/dx [c] = 0\n' +
          '• Power Rule: d/dx [xⁿ] = n · xⁿ⁻¹\n' +
          '• Constant Multiple Rule: d/dx [c · f(x)] = c · f\'(x)\n' +
          '• Sum / Difference Rule: d/dx [f(x) ± g(x)] = f\'(x) ± g\'(x)\n' +
          '• Product Rule: d/dx [u(x) · v(x)] = u\'(x) · v(x) + u(x) · v\'(x)\n' +
          '• Quotient Rule: d/dx [u(x) / v(x)] = [u\'(x) · v(x) - u(x) · v\'(x)] / [v(x)]²\n' +
          '• Chain Rule: d/dx [f(g(x))] = f\'(g(x)) · g\'(x)\n' +
          '• Natural Exponential Rule: d/dx [eˣ] = eˣ  |  General Base: d/dx [aˣ] = aˣ · ln(a)\n' +
          '• Natural Logarithmic Rule: d/dx [ln(x)] = 1/x  |  General Base: d/dx [log_a(x)] = 1 / [x · ln(a)]\n' +
          '• Trigonometric Derivatives: d/dx [sin(x)] = cos(x), d/dx [cos(x)] = -sin(x), d/dx [tan(x)] = sec²(x)\n' +
          '• Inverse Trig Derivatives: d/dx [arcsin(x)] = 1 / √(1 - x²), d/dx [arctan(x)] = 1 / (1 + x²)'
      },
      {
        title: 'Geometric & Physical Meaning of Derivatives',
        content: '1. Slope of the Tangent Line: At any given point x = a, the value f\'(a) represents the exact geometric gradient (slope m) of the straight line touching the curve without crossing it locally.\n\n' +
          '2. Instantaneous Rate of Change: In physics, if s(t) represents position over time, then the first derivative v(t) = s\'(t) represents instantaneous velocity, and the second derivative a(t) = s\'\'(t) represents instantaneous acceleration.\n\n' +
          '3. Finding Critical Points & Optimization: Setting f\'(x) = 0 locates critical points where the function has horizontal tangents, serving as candidates for local maximums, local minimums, or saddle points.'
      },
      {
        title: 'Step-by-Step Worked Differentiation Examples',
        content: 'Example 1: Polynomial Function\n' +
          'Given f(x) = 3x⁴ - 5x² + 7x - 2\n' +
          'Step 1: Differentiate term by term using Power Rule.\n' +
          '• d/dx[3x⁴] = 3 · 4x³ = 12x³\n' +
          '• d/dx[-5x²] = -5 · 2x = -10x\n' +
          '• d/dx[7x] = 7 · 1 = 7\n' +
          '• d/dx[-2] = 0\n' +
          'Result: f\'(x) = 12x³ - 10x + 7\n\n' +
          'Example 2: Product Rule\n' +
          'Given f(x) = x² · sin(x)\n' +
          'Let u = x² (u\' = 2x) and v = sin(x) (v\' = cos(x)).\n' +
          'Apply Product Rule: f\'(x) = u\'v + uv\' = (2x) · sin(x) + x² · cos(x)\n' +
          'Result: f\'(x) = 2x·sin(x) + x²·cos(x)\n\n' +
          'Example 3: Tangent Line Equation at a Point\n' +
          'Find the tangent line equation for f(x) = x² at x = 3:\n' +
          '1. Point of tangency: y₀ = f(3) = 3² = 9 -> (3, 9)\n' +
          '2. Derivative: f\'(x) = 2x\n' +
          '3. Slope: m = f\'(3) = 2(3) = 6\n' +
          '4. Tangent Line: y - 9 = 6(x - 3) => y = 6x - 18 + 9 => y = 6x - 9'
      },
      {
        title: 'First & Second Derivative Tests for Curve Sketching',
        content: 'Analyzing derivatives provides complete geometric insight into curve sketching:\n\n' +
          '• Increasing vs. Decreasing: If f\'(x) > 0 on an interval, the function is strictly increasing. If f\'(x) < 0, it is strictly decreasing.\n' +
          '• First Derivative Test: If f\'(x) changes from positive to negative at critical value c, f(c) is a local maximum. If f\'(x) changes from negative to positive, f(c) is a local minimum.\n' +
          '• Second Derivative Test: If f\'(c) = 0 and f\'\'(c) > 0, then f(c) is a relative minimum (concave up). If f\'(c) = 0 and f\'\'(c) < 0, then f(c) is a relative maximum (concave down).\n' +
          '• Points of Inflection: Occur where f\'\'(x) = 0 (or is undefined) and the concavity strictly transitions between concave up and concave down.'
      }
    ]
  },
  {
    id: 'IntegralCalculator',
    slug: 'integral-calculator',
    name: 'Integral Calculator with Graph',
    category: 'math-studio',
    shortDescription: 'Compute indefinite and definite integrals symbolically or numerically with graphs.',
    metaDescription: 'Calculate indefinite and definite integrals online. Features step-by-step symbolic derivation, numerical Simpsons fallback, and area plots.',
    keywords: ['integral calculator', 'indefinite integral', 'definite integral', 'area under curve', 'simpsons rule integration'],
    icon: 'Binary',
    howToUse: [
      'Choose between Indefinite or Definite integration mode.',
      'Enter the function expression to integrate.',
      'Specify upper and lower limits if Definite mode is active.',
      'Review the calculated anti-derivative, numeric area-under-curve, and highlighted SVG shape plotting.'
    ],
    faqs: [
      {
        question: 'How is defnite integration solved numerically?',
        answer: 'If the symbolic engine cannot resolve the antiderivative, it falls back to Simpson\'s numerical integration rule for precise area estimation.'
      }
    ],
    sections: [
      {
        title: 'The Fundamental Theorem of Calculus',
        content: 'Integration connects areas under curves with anti-derivatives. A definite integral evaluates the net accumulated area between bounds, while the indefinite integral gives the families of antiderivative functions.'
      }
    ]
  },
  {
    id: 'LimitCalculator',
    slug: 'limit-calculator',
    name: 'Limit Calculator Online',
    category: 'math-studio',
    shortDescription: 'Analyze function limits from the left, right, or two-sided with approximation tables.',
    metaDescription: 'Free online limit calculator. Analyze left-hand, right-hand, and two-sided limits at any value, including infinity, with numeric tables.',
    keywords: ['limit calculator', 'two sided limit', 'left hand limit', 'limit at infinity', 'calculus limit solver'],
    icon: 'TrendingUp',
    howToUse: [
      'Enter the function and the target limit value (use infinity/inf for limits at infinity).',
      'Select whether to evaluate the limit from the left, right, or both sides.',
      'Inspect the numerical convergence table and local coordinate graph around the target value.'
    ],
    faqs: [
      {
        question: 'What is a two-sided limit?',
        answer: 'A two-sided limit exists only if the left-hand limit equals the right-hand limit as the variable approaches the target point.'
      }
    ],
    sections: [
      {
        title: 'Concept of Limits in Calculus',
        content: 'Limits form the foundation of calculus, defining continuity, derivatives, and integrals. They describe the behavior of a function near a point, rather than exactly at it.'
      }
    ]
  },
  {
    id: 'GraphingCalculator',
    slug: 'graphing-calculator',
    name: 'Graphing Calculator Online',
    category: 'math-studio',
    shortDescription: 'Plot multiple functions on an interactive Cartesian plane with zooming and panning.',
    metaDescription: 'Free online graphing calculator. Plot multiple mathematical functions, zoom, pan, toggle grids, and export graphs as SVG/PNG.',
    keywords: ['graphing calculator', 'plot functions online', 'multi function grapher', 'cartesian coordinate plane', 'graph plotter export'],
    icon: 'LineChart',
    howToUse: [
      'Add or remove function input rows (e.g. y = sin(x), y = x^2).',
      'Use sliders or fields to adjust the X and Y coordinate viewport ranges.',
      'Zoom and pan around using the graphing viewport controls.',
      'Export the final coordinate graph directly as a high-quality SVG or PNG file.'
    ],
    faqs: [
      {
        question: 'Can I plot multiple functions simultaneously?',
        answer: 'Yes, you can add multiple input fields to overlay curves and identify intersections visually.'
      }
    ],
    sections: [
      {
        title: 'Visualizing Functions',
        content: 'Plotting functions on a coordinate grid provides immediate intuitive feedback about domain limits, roots, vertices, asymptotes, and intersection profiles.'
      }
    ]
  },
  {
    id: 'NumericalRootFinder',
    slug: 'numerical-root-finder',
    name: 'Newton-Raphson and Bisection Method Calculator',
    category: 'math-studio',
    shortDescription: 'Find equation roots using Bisection, Newton-Raphson, and Secant iterations.',
    metaDescription: 'Solve non-linear equations numerically using Bisection, Newton-Raphson, and Secant methods. Features step-by-step iteration tables.',
    keywords: ['numerical root finder', 'bisection method solver', 'newton raphson online', 'secant method calculator', 'root iterations table'],
    icon: 'Calculator',
    howToUse: [
      'Input the function expression f(x).',
      'Select the numerical method (Bisection, Newton, or Secant).',
      'Provide initial guess limits or root bounds.',
      'Set tolerance thresholds and maximum iteration limits.',
      'Review the convergence step-by-step log, graph plot, and export iterations to CSV.'
    ],
    faqs: [
      {
        question: 'When should I use the Newton-Raphson method?',
        answer: 'Newton-Raphson is highly efficient due to quadratic convergence, but requires a good initial guess and a non-zero derivative.'
      }
    ],
    sections: [
      {
        title: 'Numerical Methods for Root Finding',
        content: 'When algebraic techniques fail to solve f(x) = 0 (such as for transcendental equations), numerical algorithms iteratively approximate roots within bounds.'
      }
    ]
  },
  {
    id: 'NumericalIntegrationCalculator',
    slug: 'numerical-integration-calculator',
    name: 'Numerical Integration Calculator',
    category: 'math-studio',
    shortDescription: 'Estimate definite integrals using Trapezoidal, Simpson 1/3, and Simpson 3/8 rules.',
    metaDescription: 'Free online numerical integration calculator. Compare Trapezoidal, Simpson\'s 1/3, and Simpson\'s 3/8 rules with interval tables and area plots.',
    keywords: ['numerical integration', 'trapezoidal rule calculator', 'simpsons rule integration', 'numerical integral comparison', 'simpson 3/8 rule'],
    icon: 'Grid',
    howToUse: [
      'Enter the function and upper/lower definite limits.',
      'Set the desired number of intervals (subdivisions).',
      'Select the rule: Trapezoidal, Simpson\'s 1/3, or Simpson\'s 3/8.',
      'Compare approximation accuracy, inspect weights, and export interval data.'
    ],
    faqs: [
      {
        question: 'What are the interval requirements for Simpson\'s rules?',
        answer: 'Simpson\'s 1/3 rule requires an even number of intervals (n), while Simpson\'s 3/8 rule requires n to be a multiple of 3.'
      }
    ],
    sections: [
      {
        title: 'Approximating Area Under Curves',
        content: 'Numerical integration approximates definite integrals by dividing the area into geometric panels (trapezoids or parabolas) and summing their weights.'
      }
    ]
  },
  {
    id: 'DifferentialEquationSolver',
    slug: 'differential-equation-solver',
    name: 'Differential Equation Solver Online',
    category: 'math-studio',
    shortDescription: 'Solve first-order initial value problems using RK4, Euler, and Improved Euler methods.',
    metaDescription: 'Solve first-order ODEs numerically. Compare Euler, Heun, and Runge-Kutta 4th Order (RK4) approximation methods side-by-side with CSV exports.',
    keywords: ['differential equation solver', 'runge kutta 4 solver', 'euler method calculator', 'heun method ode', 'first order IVP solver'],
    icon: 'Compass',
    howToUse: [
      'Enter the derivative function expression dy/dx = f(x, y).',
      'Specify the initial conditions (x0, y0) and the end x limit.',
      'Set the step size parameter (h).',
      'Select and compare approximation methods on the live line plot.'
    ],
    faqs: [
      {
        question: 'What is the RK4 method?',
        answer: 'Runge-Kutta 4th Order is a highly accurate numerical solver that evaluates four slopes per step to achieve 4th-order global error scaling.'
      }
    ],
    sections: [
      {
        title: 'Numerical ODE Solvers',
        content: 'Initial Value Problems (IVPs) in physics and engineering represent dynamic rates of change. Numerical methods trace approximating step trajectories when analytic solutions are unavailable.'
      }
    ]
  },
  {
    id: 'LinearProgrammingSolver',
    slug: 'linear-programming-solver',
    name: 'Linear Programming Solver',
    category: 'math-studio',
    shortDescription: 'Optimize linear objective functions subject to linear constraints using simplex.',
    metaDescription: 'Optimize objective functions subject to linear constraints. Solve simplex linear programming problems online. Visualizes 2D constraints regions.',
    keywords: ['linear programming solver', 'simplex method calculator', 'optimize linear constraints', 'production planning lp', 'simplex tableau solver'],
    icon: 'Scale',
    howToUse: [
      'Select Optimization Goal: Maximize or Minimize.',
      'Define objective function coefficients (e.g. Z = c1*x1 + c2*x2).',
      'Add linear constraints with coefficients, inequality relations (<=, >=, =), and RHS bounds.',
      'Run solver to view basic variables, slack amounts, and the constraint space polygon.'
    ],
    faqs: [
      {
        question: 'What is the simplex algorithm?',
        answer: 'The Simplex algorithm moves along the vertices of a multi-dimensional constraint polytope to locate the optimal objective value.'
      }
    ],
    sections: [
      {
        title: 'Linear Optimization Applications',
        content: 'Linear programming maximizes yields or minimizes costs in business operations, resource allocations, logistics, and diet formulations.'
      }
    ]
  },
  {
    id: 'FourierTransformTool',
    slug: 'fourier-transform-tool',
    name: 'Fourier Transform Calculator',
    category: 'math-studio',
    shortDescription: 'Compute Fast Fourier Transforms (FFT) and Inverse FFT (iFFT) of continuous signal formulas, multi-tone synthesizers, or raw time-series arrays.',
    metaTitle: 'Fourier Transform Calculator – Fast Fourier Transform (FFT) & iFFT Spectral Studio | Toolique',
    metaDescription: 'Free online Fast Fourier Transform (FFT) & iFFT calculator. Analyze frequency spectra, power spectral density (PSD), phase angles, window functions (Hann, Hamming, Blackman), and listen to synthesized audio.',
    keywords: [
      'fourier transform calculator',
      'fft calculator online',
      'fast fourier transform',
      'inverse fourier transform',
      'ifft calculator',
      'frequency spectrum analyzer',
      'power spectral density calculator',
      'discrete fourier transform dft',
      'nyquist frequency calculator',
      'audio spectrum analyzer',
      'hann window fft',
      'spectral filter tool'
    ],
    icon: 'Activity',
    howToUse: [
      'Select your input mode: Continuous Mathematical Formula f(t), Multi-Tone Harmonic Synthesizer, or Raw Numerical CSV Array.',
      'Set the Sampling Rate (Fs) in Hz and the sample size (N points, power of 2) or choose one of the predefined signal presets.',
      'Select a windowing function (Hann, Hamming, Blackman, Flat Top, or Rectangular) to control spectral leakage.',
      'Explore the interactive graphs: Magnitude Spectrum (|X(f)| in Linear or dBV), Time Domain Waveform, Phase Spectrum, Power Spectral Density (PSD), or Complex Real/Imaginary components.',
      'Experiment with the iFFT Filter Lab (Low-Pass, High-Pass, Band-Pass, Notch) and compare original vs. reconstructed waveforms.',
      'Click "Listen to Synthesized Signal" to hear the audio tone generated directly in your browser, or export the full analysis to CSV.'
    ],
    faqs: [
      {
        question: 'What is the Fast Fourier Transform (FFT)?',
        answer: 'The Fast Fourier Transform (FFT) is an efficient algorithm to compute the Discrete Fourier Transform (DFT) and its inverse. It reduces the computational complexity from O(N²) to O(N log N), making real-time frequency analysis practical in digital signal processing (DSP).'
      },
      {
        question: 'What is the Nyquist-Shannon Sampling Theorem?',
        answer: 'The Nyquist-Shannon theorem states that to accurately reconstruct a signal without aliasing distortion, the sampling frequency (Fs) must be strictly greater than twice the maximum frequency component present in the signal: Fs > 2 × fmax. The frequency Fs / 2 is known as the Nyquist limit.'
      },
      {
        question: 'Why do we use windowing functions like Hann or Hamming in FFT?',
        answer: 'When an FFT is performed on a finite data segment, sharp discontinuities at the start and end of the sample block cause spectral leakage (energy smearing across adjacent frequency bins). Window functions taper the signal boundaries smoothly to zero, suppressing side-lobes and improving frequency resolution.'
      },
      {
        question: 'What is the difference between FFT and iFFT?',
        answer: 'FFT converts a signal from the time domain x(t) into the frequency domain X(f), revealing which frequencies are present. Inverse FFT (iFFT) performs the reverse mathematical operation, reconstructing the time-domain waveform from its complex frequency components.'
      },
      {
        question: 'How is Magnitude Spectrum converted to Decibels (dBV)?',
        answer: 'The decibel magnitude is calculated as: dBV = 20 × log10(Magnitude). A logarithmic dB scale makes it much easier to visualize weak harmonic overtones and noise floors alongside strong fundamental frequencies.'
      },
      {
        question: 'Can I listen to the synthesized signal audio?',
        answer: 'Yes! Toolique uses the browser Web Audio API to convert the computed time-domain waveform into real audible sound in real-time, allowing you to hear beats, multi-tone chords, and filter cutoffs.'
      }
    ],
    sections: [
      {
        title: 'Understanding Fourier Analysis and Spectral Decomposition',
        content: 'Fourier analysis is built on the mathematical insight that any periodic or non-periodic waveform can be represented as an infinite summation of sinusoids with varying amplitudes, frequencies, and phase shifts. In engineering, Fourier transforms bridge the gap between time-domain observations (such as audio vibrations or voltage signals) and frequency-domain diagnostics (such as harmonic distortion or resonant peaks).'
      },
      {
        title: 'Cooley-Tukey Radix-2 FFT Algorithm',
        content: 'The Cooley-Tukey algorithm breaks down a DFT of composite size N = 2^m into smaller sub-transforms recursively using bit-reversal permutations and butterfly multiplication passes. By exploiting symmetry in the twiddle factors (W_N^k = e^(-j 2π k / N)), computing an FFT of 1,024 points requires approximately 10,240 operations instead of over 1,000,000 operations required by direct DFT matrix multiplication.'
      },
      {
        title: 'Windowing Functions and Spectral Leakage Mitigation',
        content: 'Different window functions provide specific trade-offs between main-lobe width (frequency resolution) and side-lobe suppression (amplitude dynamic range):\n- **Hann (Hanning)**: Excellent general-purpose window for random signals and noise reduction.\n- **Hamming**: Optimized first side-lobe cancellation (-43 dB).\n- **Blackman**: Heavy side-lobe suppression (-58 dB) ideal for wide dynamic range spectral analysis.\n- **Flat Top**: Best for calibrated sinusoidal amplitude accuracy with slight broadening of peak width.'
      },
      {
        title: 'Parseval\'s Theorem and Energy Conservation',
        content: 'Parseval\'s theorem establishes that the total energy in the time-domain equals the total spectral energy in the frequency-domain: ∑ |x[n]|² = (1/N) ∑ |X[k]|². This principle guarantees that frequency-domain filtering and synthesis preserve the quantitative energy properties of physical systems.'
      }
    ]
  },
  {
    id: 'ComplexNumberCalculator',
    slug: 'complex-number-calculator',
    name: 'Complex Number Calculator',
    category: 'math-studio',
    shortDescription: 'Perform complex algebra, roots of unity, De Moivre powers, AC impedance, and plot on an interactive Argand diagram.',
    metaTitle: 'Complex Number Calculator – Arithmetic, Polar Conversion & Argand Diagram | Toolique',
    metaDescription: 'Free online Complex Number Calculator. Add, multiply, divide, compute powers, find n-th roots of unity, calculate AC RLC impedance, and plot vectors on an interactive Argand plane.',
    keywords: [
      'complex number calculator',
      'argand diagram calculator',
      'polar form complex numbers',
      'de moivre roots calculator',
      'complex roots of unity',
      'euler formula complex',
      'ac impedance calculator',
      'rectangular to polar complex',
      'complex conjugate calculator',
      'complex algebra online'
    ],
    icon: 'Compass',
    howToUse: [
      'Select your calculation mode: Arithmetic (Z1 op Z2), Analytic Functions (Properties of Z1), De Moivre Roots of Unity, or AC RLC Circuit Impedance.',
      'Enter complex numbers in either Cartesian/Rectangular format (a + bi) or Polar/Phasor format (r ∠ θ°).',
      'Choose the operation: Addition (+), Subtraction (-), Multiplication (×), Division (÷), Complex Exponentiation (^), or Parallel Impedance (∥).',
      'Inspect the interactive Argand Diagram with vector arrows, modulus circles, and root polygon geometry.',
      'Review instant conversions across Rectangular, Polar (degrees/radians), and Euler exponential (r · e^(iθ)) notations alongside step-by-step math derivations.'
    ],
    faqs: [
      {
        question: 'What is a complex number and an imaginary unit?',
        answer: 'A complex number is an expression of the form a + bi, where a is the real part, b is the imaginary part, and i is the imaginary unit defined by the fundamental property i² = -1.'
      },
      {
        question: 'What is an Argand Diagram?',
        answer: 'An Argand diagram is a geometric representation of complex numbers as 2D position vectors on a Cartesian coordinate plane, where the horizontal axis represents the Real part (Re) and the vertical axis represents the Imaginary part (Im).'
      },
      {
        question: 'How do you convert between Rectangular and Polar forms?',
        answer: 'From Rectangular (a + bi) to Polar (r ∠ θ): r = √(a² + b²) and θ = atan2(b, a). From Polar (r ∠ θ) to Rectangular: a = r · cos(θ) and b = r · sin(θ).'
      },
      {
        question: 'What is De Moivre\'s Theorem for powers and roots?',
        answer: 'De Moivre\'s theorem states that for any real number θ and integer n: (cos θ + i sin θ)^n = cos(nθ) + i sin(nθ). To find the n-th roots of z = r e^(iθ), the roots are given by: wk = r^(1/n) · e^(i(θ + 2kπ)/n) for k = 0, 1, ..., n - 1.'
      },
      {
        question: 'How are complex numbers used in AC electrical circuits?',
        answer: 'In alternating current (AC) circuit analysis, sinusoids are represented as complex phasors. Resistance is purely real (R), inductive reactance is positive imaginary (+jωL), and capacitive reactance is negative imaginary (-j/(ωC)), allowing circuit networks to be analyzed using standard Ohm\'s and Kirchhoff\'s laws: V = I · Z.'
      }
    ],
    sections: [
      {
        title: 'Fundamental Operations on Complex Numbers',
        content: 'Complex arithmetic follows the standard field axioms of real algebra combined with the identity i² = -1:\n- **Addition & Subtraction**: Performed component-wise: (a + bi) ± (c + di) = (a ± c) + (b ± d)i.\n- **Multiplication**: (a + bi)(c + di) = (ac - bd) + (ad + bc)i.\n- **Division**: Multiplied by the complex conjugate of the denominator: (a + bi)/(c + di) = [(ac + bd) + (bc - ad)i] / (c² + d²).'
      },
      {
        title: 'Euler\'s Formula and Exponential Representation',
        content: 'Euler\'s identity e^(iθ) = cos(θ) + i sin(θ) establishes a profound bridge between trigonometry and complex analysis. It allows multiplication and division to be conceptualized as scaling and rotation in the complex plane: multiplying by e^(iθ) rotates any vector counterclockwise by angle θ without altering its magnitude.'
      },
      {
        title: 'Roots of Unity and Regular Polygon Geometry',
        content: 'The n-th roots of unity are the solutions to the equation z^n = 1. In the Argand plane, these n solutions lie on the unit circle (|z| = 1) spaced at equal angular intervals of 2π/n radians, forming the vertices of a regular n-sided polygon centered at the origin.'
      }
    ]
  },
  {
    id: 'VectorCalculator',
    slug: 'vector-calculator',
    name: 'Vector Calculator',
    category: 'math-studio',
    shortDescription: 'Calculate dot products, cross products, projections, and angles for 2D/3D vectors.',
    metaDescription: 'Perform vector operations in 2D and 3D space. Calculate dot products, cross products, magnitudes, projections, and angles with vector diagrams.',
    keywords: ['vector calculator', 'cross product solver', 'dot product calculator', 'vector projection', 'angle between vectors'],
    icon: 'LineChart',
    howToUse: [
      'Choose coordinate dimensions: 2D or 3D.',
      'Enter vector coefficients for Vector U and Vector V.',
      'Select the operation: Add, Subtract, Dot Product, Cross Product, Projection, or Unit Vector.',
      'View calculation formulas, midpoints, coordinates, and 2D vector plots.'
    ],
    faqs: [
      {
        question: 'What does the cross product represent?',
        answer: 'The cross product of two 3D vectors is a vector perpendicular to both, with a magnitude proportional to the area of the spanned parallelogram.'
      }
    ],
    sections: [
      {
        title: 'Vector Spaces and Coordinate Mechanics',
        content: 'Vectors represent magnitude and direction, defining structural clearances, force calculations, and pathing matrices in engineering disciplines.'
      }
    ]
  },
  {
    id: 'RegressionCalculator',
    slug: 'regression-calculator',
    name: 'Regression Calculator',
    category: 'math-studio',
    shortDescription: 'Fit linear, polynomial, and exponential regression models to X/Y datasets.',
    metaDescription: 'Fit data to linear, polynomial, or exponential curves online. Calculates regression equations, R2, predicted values, and residuals plots.',
    keywords: ['regression calculator', 'polynomial curve fitting', 'exponential regression online', 'least squares regression', 'residuals scatter plot'],
    icon: 'TrendingUp',
    howToUse: [
      'Paste your numeric X and Y coordinate data or upload a CSV file.',
      'Select the regression fit model: Linear, Polynomial (up to degree 4), or Exponential.',
      'Input an optional forecast X value to predict future Y estimates.',
      'Inspect the scatter curve fit and download calculations summaries.'
    ],
    faqs: [
      {
        question: 'When should I select exponential regression?',
        answer: 'Use exponential regression when the rate of change is proportional to the current value, such as population growths or capacitor discharge loops.'
      }
    ],
    sections: [
      {
        title: 'Regression Fits and Curve Modeling',
        content: 'Regression analyzes dependencies between variables. The R-squared metric represents the proportion of variance explained by the model.'
      }
    ]
  },
  {
    id: 'ProbabilityDistributionCalculator',
    slug: 'probability-distribution-calculator',
    name: 'Probability Distribution Calculator',
    category: 'math-studio',
    shortDescription: 'Analyze Poisson, Exponential, Binomial, and Normal curves with PDF/CDF bounds.',
    metaDescription: 'Analyze probability distributions online. Calculate PDF/PMF, CDF, means, variances, and range probabilities for Normal, Binomial, Poisson, and Exponential models.',
    keywords: ['probability distribution calculator', 'poisson pmf calculator', 'normal cdf solver', 'exponential distribution calculator', 'distribution standard deviation'],
    icon: 'Activity',
    howToUse: [
      'Select the distribution: Normal, Binomial, Poisson, or Exponential.',
      'Adjust parameter settings (mean, variance, trials, rates).',
      'Set X boundaries (e.g. X <= x, or a <= X <= b) to calculate range probability.',
      'Examine the PDF curve plot showing standard bounds.'
    ],
    faqs: [
      {
        question: 'What is the Poisson distribution used for?',
        answer: 'Poisson models discrete counts of events occurring within fixed intervals, e.g. customer phone calls per hour or website visits per minute.'
      }
    ],
    sections: [
      {
        title: 'Statistical Distributions in Practice',
        content: 'Continuous and discrete probability distributions describe variations in nature and systems, supporting safety factors design, failure rates, and quality assurances.'
      }
    ]
  }
];
