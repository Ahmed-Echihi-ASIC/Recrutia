export default function RegisterStepIdentificationValidation(form) {
    const errors = {};

    if (!form.typePiece?.trim()) {
        errors.typePiece =
            "Le type de pièce d'identité est obligatoire.";
    }

    if (!form.numeroPiece?.trim()) {
        errors.numeroPiece =
            "Le numéro de la pièce d'identité est obligatoire.";
    }

    if (!form.dateExpiration) {
        errors.dateExpiration =
            "La date d'expiration est obligatoire.";
    }

    

    if (!form.nni.trim()) {
        errors.nni = "Le numéro d'identification est obligatoire.";
    }

    return errors;
}