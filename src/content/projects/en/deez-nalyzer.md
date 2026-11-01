---
title: "Deez'Nalyzer: exploring music with audio ML"
description: "A Django and Vue web app that turns Deezer previews into MERT audio embeddings to explore songs in 3D, find similar tracks and predict their genres."
---

# Deez'Nalyzer: seeing how songs relate to each other

## The problem

Genre labels and playlists say little about how songs actually sound, or how close two of them are. In this machine learning project at INSA Rouen Normandie, our team of three wanted to describe each track with numbers computed from the audio itself, then explore those numbers: see which songs sit close together, look for similar tracks and try to predict genres.

Deez'Nalyzer is an academic prototype for experimenting with music information retrieval. It is not a streaming client, and it does not generate audio.

## Architecture

The application has two parts. A Django REST Framework API in Python 3.11 handles the Deezer integration and the audio and machine learning pipeline. A Vue 3 and TypeScript interface displays the results with interactive Plotly charts.

Data goes through four steps:

1. **Collect.** The API searches public Deezer tracks and playlists and downloads the available preview clips. Imported playlists go through download and embedding queues that the interface can monitor.
2. **Represent.** The pretrained MERT-v1-330M model turns each preview into a numerical audio representation, stored in a local dataset.
3. **Explore.** PCA or UMAP projects these high-dimensional representations into three dimensions for an interactive 3D view.
4. **Discover.** Cosine similarity between embeddings finds nearby tracks, and a scikit-learn classifier predicts genres.

## Technical choices

- **A pretrained audio model.** MERT, loaded with Hugging Face Transformers and PyTorch, provides the representations instead of hand-picked features; librosa, torchaudio and FFmpeg prepare the audio.
- **Two projections side by side.** PCA and UMAP can be compared on the same dataset, and a chart shows the cumulative explained variance of the PCA components, which tells how much of the data the three displayed axes keep.
- **Multi-label genres.** A track can belong to several genres, so the classifier can assign more than one label.
- **Similarity, not generation.** The Compose feature looks for similar existing tracks. It does not synthesize audio or publish Deezer playlists.
- **Container images.** GitHub Actions build the frontend and backend Docker images and publish them to GitHub Container Registry.

## Results

The prototype covers the whole chain: Deezer search and playlist import, MERT embeddings, 3D exploration with PCA and UMAP, similarity search and genre classification. The code is open source under the MIT license. Deez'Nalyzer is an independent student project, not affiliated with or endorsed by Deezer.

## Limitations

- MERT is a large model: loading it takes time and a lot of memory, especially on a CPU.
- Most analysis features need a populated dataset first, and depend on the previews Deezer makes available.
- The Docker Compose file is an example, not a ready-to-use production deployment.
- Personalized recommendations, playlist export and lyrics analysis remain ideas, not features.

## Explore the project

- [Source code and setup instructions](https://github.com/AlixANNERAUD/deez_nalyzer)
