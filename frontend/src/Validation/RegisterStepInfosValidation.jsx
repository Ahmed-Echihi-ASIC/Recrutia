export default function RegisterStepInfosValidation(form) {
    const errors = {};

    if (!form.diplome.trim()) {
        errors.diplome = "Le diplôme est obligatoire.";
    }

    if (!form.nom.trim()) {
        errors.nom = "Le nom est obligatoire.";
    }

    if (!form.prenom.trim()) {
        errors.prenom = "Le prénom est obligatoire.";
    }

    

    if (!form.dateNaissance) {
        errors.dateNaissance = "La date de naissance est obligatoire.";
    }

    if (!form.region.trim()) {
        errors.region = "La région est obligatoire.";
    }

    if (!form.ville.trim()) {
        errors.ville = "La région est obligatoire.";
    }

    if (!form.telephone.trim()) {
        errors.telephone = "Le téléphone est obligatoire.";
    } else if (!/^[0-9]{8,15}$/.test(form.telephone)) {
        errors.telephone = "Numéro de téléphone invalide.";
    }

    if (!form.email.trim()) {
        errors.email = "L'email est obligatoire.";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
        errors.email = "Adresse email invalide.";
    }

    if (!form.password.trim()) {
        errors.password = "Le mot de passe est obligatoire.";
    } else if (form.password.length < 8) {
        errors.password =
            "Le mot de passe doit contenir au moins 8 caractères.";
    }

    if (!form.confirmPassword.trim()) {
        errors.confirmPassword =
            "Veuillez confirmer le mot de passe.";
    } else if (form.password !== form.confirmPassword) {
        errors.confirmPassword =
            "Les mots de passe ne correspondent pas.";
    }

    return errors;
}