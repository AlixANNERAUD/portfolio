---
title: "Deep learning for melanoma histopathology"
description: "Adapting CellViT++, nnU-Net and HoVer-Net to classify cell nuclei and segment tissue in melanoma images from the PUMA dataset, in a team of two at INSA Rouen."
---

# Deep learning for melanoma histopathology

## The problem

The [PUMA challenge](https://puma.grand-challenge.org/) targets the segmentation of nuclei and tissue in histopathology images of advanced melanoma. It combines two tasks: locating each cell nucleus and identifying its type, such as tumor cells or lymphocytes, and segmenting larger tissue regions, such as tumor and stroma. The dataset provides H&E-stained regions of 1,024 × 1,024 pixels with expert-reviewed annotations in GeoJSON.

For our deep learning project at INSA Rouen Normandie, in 2025, our team of two explored how existing medical imaging models can be adapted to these tasks, rather than designing a new network.

## Architecture

The repository has one directory per model, each with its own Python environment, and includes the original implementations as Git submodules:

- **CellViT++.** Conversion of the PUMA annotations, training of a nucleus classification head on a CellViT-SAM-H backbone, and a hyperparameter search tracked with Weights & Biases.
- **nnU-Net.** Preparation of the PUMA and NSCLC datasets, a custom trainer and loss that ignore a label value, and a workflow that pretrains on NSCLC before fine-tuning on PUMA.
- **HoVer-Net.** Preparation of image patches and annotation masks.

Training ran as SLURM jobs on a GPU cluster. A presentation notebook gathers the motivation, model choices, experiment logs and results.

## Technical choices

- **Established models.** Building on CellViT++, nnU-Net and HoVer-Net let us spend the project on data preparation, training and analysis.
- **Annotation conversion.** Python scripts turn the GeoJSON annotations into the masks and formats each model expects.
- **One environment per model.** Each directory has its own uv project and lock file, since the three models do not share their dependencies.
- **Transfer learning.** The nnU-Net workflow starts from a model pretrained on the NSCLC lung cancer dataset before training on melanoma images.

## Results

Our main completed experiment used CellViT++ with a trained classification head. On the validation set, our presentation reports an AUROC of about 0.93, an F1 score of about 0.77 and an average precision of about 0.45. These are validation observations from the project, not test-set or PUMA leaderboard results.

The nnU-Net training stalled in the cluster environment, and HoVer-Net remained an experimental integration, so the project does not compare the three models.

## Limitations

- The experiments ran into class imbalance, limited GPU availability, dependency conflicts and reproducibility issues.
- The SLURM scripts contain paths and settings specific to our cluster, and a clean end-to-end run from the repository alone is not guaranteed.
- Datasets and model weights are not included, and the label mappings in the conversion scripts are not fully configured.
- This is educational research code, not a clinically validated diagnostic tool.

## Explore the project

- [Source code, scripts and presentation](https://github.com/AlixANNERAUD/deep_learning_project)
