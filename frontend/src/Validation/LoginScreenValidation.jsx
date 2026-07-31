export default function loginValidation(email, password) {
  const errors = {};

  // Email
  if (!email.trim()) {
    errors.email = "L'email est obligatoire";
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    errors.email = "Adresse email invalide";
  }

  // Mot de passe
  if (!password.trim()) {
    errors.password = "Le mot de passe est obligatoire";
  } 

  return errors;
}