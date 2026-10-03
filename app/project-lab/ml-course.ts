import type {NotebookCourse} from './notebook-course';
export const mlCourse:NotebookCourse={
  "id": "iris-classifier",
  "title": "Your first classifier",
  "stack": "Python · scikit-learn · pandas",
  "filename": "iris-classifier.ipynb",
  "packages": [
    "numpy",
    "pandas",
    "scikit-learn"
  ],
  "lessons": [
    {
      "id": "explore",
      "title": "Explore labeled data",
      "goal": "Use flower measurements to predict a species.",
      "body": "Supervised learning learns from examples with known answers. Iris contains 150 flowers, four measurements in centimeters, and three species. X holds the input features; y holds the target labels. Keep the target out of X to avoid giving the model the answer.",
      "steps": [
        "Run the imports and load the built-in dataset. No account or dataset upload is needed.",
        "Inspect X.shape, X.head() and y.value_counts().",
        "Use iris.target_names to see which species the numeric labels represent."
      ],
      "hint": "load_iris(as_frame=True) returns pandas tables. Each row of X corresponds to the same indexed row of y.",
      "starter": "import numpy as np\nimport pandas as pd\nfrom sklearn.datasets import load_iris\n\niris = load_iris(as_frame=True)\nX = iris.data\ny = iris.target\nprint(\"Shape:\", X.shape)\nprint(\"Species:\", iris.target_names)\nX.head()",
      "solution": "import numpy as np\nimport pandas as pd\nfrom sklearn.datasets import load_iris\n\niris = load_iris(as_frame=True)\nX = iris.data\ny = iris.target\nprint(\"Shape:\", X.shape)\nprint(\"Species:\", iris.target_names)\nprint(y.value_counts())\nX.head()",
      "check": "assert X.equals(iris.data) and y.equals(iris.target), \"Keep the four measurements in X and the species labels in y.\"",
      "source": "https://scikit-learn.org/stable/modules/generated/sklearn.datasets.load_iris.html"
    },
    {
      "id": "split",
      "title": "Reserve unseen examples",
      "goal": "Separate training data from the final test set.",
      "body": "Split before fitting anything. Stratification keeps each species represented, and random_state makes the split reproducible. Train on 120 flowers and reserve 30 for a final evaluation. Never fit preprocessing or the classifier on the test set.",
      "steps": [
        "Import train_test_split from sklearn.model_selection.",
        "Create X_train, X_test, y_train, y_test with test_size=0.2, random_state=42 and stratify=y.",
        "Print the shapes and test label counts. Expect 10 test flowers per species."
      ],
      "hint": "Pass X and y together so their rows stay aligned.",
      "starter": "# TODO: split X and y before training.\nprint(X.shape)",
      "solution": "from sklearn.model_selection import train_test_split\nX_train, X_test, y_train, y_test = train_test_split(\n    X, y, test_size=0.2, random_state=42, stratify=y\n)\nprint(\"Train:\", X_train.shape, \"Test:\", X_test.shape)\ny_test.value_counts()",
      "check": "assert len(X_train) == 120 and len(X_test) == 30, \"Use an 80/20 split.\"\nassert set(X_train.index).isdisjoint(X_test.index), \"Training and test rows must not overlap.\"\nassert set(X_train.index) | set(X_test.index) == set(X.index), \"Use all rows exactly once.\"\nassert X_train.equals(X.loc[X_train.index]) and X_test.equals(X.loc[X_test.index]), \"Keep the original feature values.\"\nassert y_train.equals(y.loc[X_train.index]) and y_test.equals(y.loc[X_test.index]), \"Keep labels aligned with features.\"\nassert (y_test.value_counts() == 10).all(), \"Stratify the split by y.\"",
      "source": "https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.train_test_split.html"
    },
    {
      "id": "baseline",
      "title": "Measure a simple baseline",
      "goal": "Establish what a model must improve on.",
      "body": "Accuracy is the fraction of correct predictions. A DummyClassifier that always chooses the most frequent training label ignores all measurements. On this balanced dataset it scores about 33%. A baseline gives your trained model a useful comparison.",
      "steps": [
        "Import DummyClassifier and accuracy_score.",
        "Fit baseline = DummyClassifier(strategy=\"most_frequent\") using only the training set.",
        "Calculate baseline_accuracy on X_test and y_test."
      ],
      "hint": "accuracy_score takes the true labels first and predicted labels second.",
      "starter": "# TODO: fit a dummy classifier and calculate baseline_accuracy.",
      "solution": "from sklearn.dummy import DummyClassifier\nfrom sklearn.metrics import accuracy_score\nbaseline = DummyClassifier(strategy=\"most_frequent\")\nbaseline.fit(X_train, y_train)\nbaseline_accuracy = accuracy_score(y_test, baseline.predict(X_test))\nprint(f\"Baseline accuracy: {baseline_accuracy:.1%}\")",
      "check": "assert isinstance(baseline, DummyClassifier) and baseline.strategy == \"most_frequent\", \"Use the most-frequent-label baseline.\"\nassert np.isclose(baseline_accuracy, 1/3), \"Evaluate the baseline on the balanced test set.\"",
      "source": "https://scikit-learn.org/stable/modules/generated/sklearn.dummy.DummyClassifier.html"
    },
    {
      "id": "train",
      "title": "Train a classifier",
      "goal": "Fit a preprocessing and classification pipeline.",
      "body": "StandardScaler learns feature means and scales from training data. LogisticRegression learns a decision rule for the species; despite its name, it is a classifier. A pipeline applies the same learned scaling when predicting new examples.",
      "steps": [
        "Import make_pipeline, StandardScaler and LogisticRegression.",
        "Create model = make_pipeline(StandardScaler(), LogisticRegression(max_iter=200, random_state=42)).",
        "Fit model on X_train and y_train. Do not fit on X_test."
      ],
      "hint": "Call model.fit(X_train, y_train). The pipeline fits both steps in order.",
      "starter": "# TODO: create and fit model using only training data.",
      "solution": "from sklearn.pipeline import make_pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.linear_model import LogisticRegression\nmodel = make_pipeline(\n    StandardScaler(), LogisticRegression(max_iter=200, random_state=42)\n)\nmodel.fit(X_train, y_train)\nprint(\"Trained on\", len(X_train), \"flowers.\")",
      "check": "assert isinstance(model.steps[0][1], StandardScaler), \"Start the pipeline with StandardScaler.\"\nassert isinstance(model.steps[-1][1], LogisticRegression), \"Use LogisticRegression as the classifier.\"\nassert model.steps[0][1].n_samples_seen_ == 120, \"Fit the pipeline on training rows only.\"\nassert np.allclose(model.steps[0][1].mean_, X_train.mean()), \"Learn scaling from X_train only.\"\nassert len(model.predict(X_test)) == 30, \"Fit the model before predicting.\"",
      "source": "https://scikit-learn.org/stable/common_pitfalls.html"
    },
    {
      "id": "evaluate",
      "title": "Evaluate the model",
      "goal": "Compare accuracy and inspect the mistakes.",
      "body": "Predict on the held-out test set once your model is fixed. In the confusion matrix, rows are true species and columns are predicted species; the diagonal counts correct predictions. Thirty test flowers give a limited estimate, not a guarantee on future data. For model tuning, use cross-validation on the training set and keep the final test set untouched.",
      "steps": [
        "Create predictions = model.predict(X_test).",
        "Calculate test_accuracy with accuracy_score.",
        "Create confusion using confusion_matrix, with iris.target_names as row and column labels.",
        "Compare the model with baseline_accuracy and inspect off-diagonal mistakes."
      ],
      "hint": "Wrap confusion_matrix(y_test, predictions, labels=[0, 1, 2]) in pd.DataFrame.",
      "starter": "# TODO: calculate predictions, test_accuracy and confusion.",
      "solution": "from sklearn.metrics import confusion_matrix\npredictions = model.predict(X_test)\ntest_accuracy = accuracy_score(y_test, predictions)\nprint(f\"Baseline: {baseline_accuracy:.1%} | Model: {test_accuracy:.1%}\")\nconfusion = pd.DataFrame(\n    confusion_matrix(y_test, predictions, labels=[0, 1, 2]),\n    index=iris.target_names, columns=iris.target_names\n)\nconfusion",
      "check": "assert np.array_equal(predictions, model.predict(X_test)), \"Predict on the held-out test features.\"\nassert np.isclose(test_accuracy, accuracy_score(y_test, predictions)), \"Compute accuracy from test labels and predictions.\"\nassert np.array_equal(np.asarray(confusion), confusion_matrix(y_test, predictions, labels=[0, 1, 2])), \"Build the confusion matrix from the same test predictions.\"",
      "source": "https://scikit-learn.org/stable/modules/generated/sklearn.metrics.confusion_matrix.html"
    },
    {
      "id": "predict",
      "title": "Predict new flowers",
      "goal": "Use the model on measurements it has never seen.",
      "body": "New inputs must use the same feature names, order and units as training data. predict_proba returns model-estimated class probabilities, which are not guaranteed to be calibrated confidence. This small teaching dataset does not establish reliability on arbitrary real-world flowers.",
      "steps": [
        "Create new_flowers with at least two rows of four measurements, using columns=X.columns.",
        "Calculate species = iris.target_names[model.predict(new_flowers)].",
        "Calculate probabilities = model.predict_proba(new_flowers) and show the results.",
        "Restart the kernel and Run all, then download the notebook to keep exploring in Jupyter."
      ],
      "hint": "Feature order is sepal length, sepal width, petal length, petal width, all in centimeters.",
      "starter": "new_flowers = pd.DataFrame(\n    [[5.1, 3.5, 1.4, 0.2], [6.7, 3.0, 5.2, 2.3]],\n    columns=X.columns\n)\n# TODO: calculate species and probabilities.\nnew_flowers",
      "solution": "new_flowers = pd.DataFrame(\n    [[5.1, 3.5, 1.4, 0.2], [6.7, 3.0, 5.2, 2.3]],\n    columns=X.columns\n)\nspecies = iris.target_names[model.predict(new_flowers)]\nprobabilities = model.predict_proba(new_flowers)\nresults = pd.DataFrame(probabilities, columns=iris.target_names)\nresults.insert(0, \"predicted_species\", species)\nresults.round(3)",
      "check": "assert len(new_flowers) >= 2 and list(new_flowers.columns) == list(X.columns), \"Supply at least two flowers with the original feature columns.\"\nassert np.array_equal(species, iris.target_names[model.predict(new_flowers)]), \"Convert predicted labels into species names.\"\nassert np.allclose(probabilities, model.predict_proba(new_flowers)), \"Use the fitted model's class probabilities.\"\nassert np.allclose(probabilities.sum(axis=1), 1), \"Each probability row should sum to one.\"",
      "source": "https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.LogisticRegression.html"
    }
  ]
};
