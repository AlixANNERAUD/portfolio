---
title: "Covid3D: 3D-printed face shields in 2020"
description: During the first 2020 lockdown, I printed about 1,000 face shields for the Covid3D platform, with custom G-code that printed and ejected stacks of frames.
---

# Covid3D: printing face shields during the first lockdown

## Overview

During the first lockdown in 2020, I took part in the Covid3D platform of Le Labo d'Héliox. I made about 1,000 face shields, each consisting of a printed frame and a plastic sheet, for around twenty recipients. Most of them were public institutions, such as medical centers and medico-psychological centers (CMPP).

## Technical choices

The shields were printed on a **Geeetech A20M**. For this series, I wrote custom **G-code**:

- **Stacks of five.** Each print job produced a stack of five frames instead of a single one.
- **Tuned settings.** Print speed and precision were adjusted for these parts.
- **Automatic ejection.** I printed an extra part and mounted it under the print head's fan. At the end of a job, the head used it to push the finished stack off the bed, leaving it free for the next one.
