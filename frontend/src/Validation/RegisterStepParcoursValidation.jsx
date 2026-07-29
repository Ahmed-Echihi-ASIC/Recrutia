export default function RegisterStepParcoursValidation(form) {
    const errors = {};

    if (!form.nombreDiplome?.trim()) {
        errors.nombreDiplome = "Le nombre de diplômes est obligatoire.";
    }

    if (!form.NiveauEtude?.trim()) {
        errors.NiveauEtude = "Le niveau d'étude est obligatoire.";
    }

    if (!form.specialite?.trim()) {
        errors.specialite = "La spécialité est obligatoire.";
    }

    if (!form.ConditionPhysique?.trim()) {
        errors.ConditionPhysique =
            "La condition physique est obligatoire.";
    }

    if (!form.NbrExperience?.trim()) {
        errors.NbrExperience =
            "Le nombre d'expériences est obligatoire.";
    }

    if (!form.DureeExperience?.trim()) {
        errors.DureeExperience =
            "La durée d'expérience est obligatoire.";
    } 

    return errors;
}