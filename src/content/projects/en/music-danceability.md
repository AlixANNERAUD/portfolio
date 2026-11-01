---
title: "Predicting the danceability of Spotify songs"
description: "A team data science project that models Spotify's danceability score with multiple linear regression on 160,000 songs, then tests it on tracks from the API."
---

# Explaining Spotify's danceability score with linear regression

## The problem

Spotify gives every track a danceability score computed from its audio. For our introductory data science course, in 2023, our team of three asked which characteristics of a song explain this score, and how closely a simple statistical model can reproduce it.

We started from a Kaggle dataset of about 160,000 songs released between 1921 and 2020, extracted from the Spotify Web API. The target is Spotify's own estimate, not an assessment of how people actually dance: a model fitted to it learns to imitate Spotify's calculation, biases included.

## Architecture

The analysis is a single Jupyter notebook in Python, written up in a LaTeX report. It goes through five steps:

1. **Prepare.** Load the dataset, drop redundant columns such as the release date, encode the musical key and standardize the data.
2. **Explore.** Plot the distribution of each variable and the correlation matrix, then run a principal component analysis.
3. **Model.** Fit a multiple linear regression of danceability on the other variables.
4. **Diagnose.** Reduce the set of variables, remove outliers and fit the model again.
5. **Apply.** Search tracks through the Spotify API, predict their danceability and compare the prediction with the score Spotify returns.

## Technical choices

- **Common Python tools.** pandas and NumPy for the data, scikit-learn for the regression and the PCA, SciPy for the statistical tests, Matplotlib for the charts and Spotipy for the API.
- **One-hot encoding.** The musical key becomes twelve binary columns, so the regression can give each key its own coefficient.
- **Forward selection.** Variables are added one at a time, and the subset with the lowest Mallows' Cp is kept.
- **Outliers from leverage and contribution.** Each song's leverage and contribution to the model are computed in blocks of 1,000 songs to limit memory use; songs above the thresholds are removed.
- **Statistical tests.** A Shapiro-Wilk test checks whether danceability follows a normal distribution, and Student's t-tests compare explicit and non-explicit songs on danceability and on popularity.

## Results

- Valence, speechiness, year and popularity were the variables most associated with a higher danceability, while acousticness, energy and liveness lowered it. The key had no significant effect.
- The model chosen by forward selection reached an R² of about 0.49, and about 0.65 after removing outliers. Both values were computed on the data used to fit the model.
- The notebook also compares popularity between explicit and non-explicit songs, but that test selects the wrong columns, so we draw no conclusion from it. For danceability, the test returned a p-value of exactly 0, which we flagged as suspicious.
- On tracks fetched from the API, predictions differed from Spotify's scores. We attributed the gaps to a dataset that may be outdated and to variables Spotify uses but the dataset lacks.

## Limitations

- The model can at best reproduce Spotify's calculation, not a human judgment of danceability.
- There is no separate test set, so the R² values say how well the model fits, not how well it predicts new songs.
- The year is treated as a continuous variable, which the notebook itself suggests revisiting.
- Only linear models were tried.
- Running the application step requires your own Spotify API credentials.

## Explore the project

- [Notebook, data and LaTeX report](https://github.com/AlixANNERAUD/music_danceability_prediction) (in French).
