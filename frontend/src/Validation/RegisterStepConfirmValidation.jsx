export default function RegisterStepConfirmValidation(form) {
    const errors = {};

    if (!form.lieuNaissance?.trim()) {
        errors.lieuNaissance =
            "Le lieu de naissance est obligatoire.";
    }

    if (!form.situationFamiliale?.trim()) {
        errors.situationFamiliale =
            "La situation familiale est obligatoire.";
    }

    if (!form.nombreEnfant?.trim()) {
        errors.nombreEnfant =
            "Le nombre d'enfant est obligatoire.";
    } else if (!/^[0-9]+$/.test(form.nombreEnfant)) {
        errors.nombreEnfant =
            "Le nombre d'enfant doit être numérique.";
    }

    if (!form.adresse?.trim()) {
        errors.adresse =
            "L'adresse est obligatoire.";
    }

    if (!form.ville?.trim()) {
        errors.ville =
            "La ville est obligatoire.";
    }

    if (!form.arrondissement?.trim()) {
        errors.arrondissement =
            "L'arrondissement est obligatoire.";
    }

    return errors;
}