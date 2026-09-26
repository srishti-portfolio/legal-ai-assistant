export type LanguageCode = "en" | "hi" | "es" | "fr" | "de" | "pt" | "ar" | "zh";

/** Always shown in the language's own script, regardless of current UI language — the
 * standard convention (see how every OS language picker does this) so a reader can find
 * their language even if the current UI text is unreadable to them. */
export const LANGUAGE_NATIVE_NAMES: Record<LanguageCode, string> = {
  en: "English",
  hi: "हिन्दी",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  pt: "Português",
  ar: "العربية",
  zh: "中文",
};

export interface Translations {
  skipToContent: string;
  navHome: string;
  navHistory: string;
  navYou: string;
  navLogout: string;

  loginTitle: string;
  loginSubtitle: string;
  emailLabel: string;
  passwordLabel: string;
  signIn: string;
  signingIn: string;
  noAccountYet: string;
  createOne: string;

  registerTitle: string;
  registerSubtitle: string;
  nameLabel: string;
  passwordHint: string;
  languageLabel: string;
  createAccount: string;
  creatingAccount: string;
  alreadyHaveAccount: string;

  yourDocuments: string;
  askAQuestionHeading: string;
  loadingDocuments: string;
  loadingConversation: string;
  errorLoadDocuments: string;
  errorLoadConversation: string;
  errorLoadHistory: string;
  errorDelete: string;
  errorAsk: string;

  dropText: string;
  fileHint: string;
  uploading: string;
  uploadErrorGeneric: string;

  noDocumentsUploaded: string;
  statusProcessing: string;
  statusReady: string;
  statusFailed: string;
  deleteLabel: string;

  composerSrLabel: string;
  composerPlaceholderDisabled: string;
  composerPlaceholderEnabled: string;
  ask: string;
  asking: string;

  chatGuidance: string;
  foundInDocument: string;
  notMentioned: string;
  viewSourcePassages: string; // use {n} as a placeholder for the count
  pageLabel: string;

  historyTitle: string;
  historyEmpty: string;
  deletedDocument: string;
  unknownDocument: string;
  questionPrefix: string;

  yourProfile: string;
  saveChanges: string;
  saving: string;
  profileUpdated: string;
  profileUpdateError: string;

  notFoundTitle: string;
  notFoundSubtitle: string;
  goBackHome: string;
}

export const translations: Record<LanguageCode, Translations> = {
  en: {
    skipToContent: "Skip to main content",
    navHome: "Home",
    navHistory: "History",
    navYou: "You",
    navLogout: "Log out",

    loginTitle: "Welcome back",
    loginSubtitle: "Sign in to ClearTerms to continue asking questions about your documents.",
    emailLabel: "Email",
    passwordLabel: "Password",
    signIn: "Sign in",
    signingIn: "Signing in...",
    noAccountYet: "No account yet?",
    createOne: "Create one",

    registerTitle: "Create your account",
    registerSubtitle:
      "Upload a contract or policy and get plain-language answers grounded only in what it actually says.",
    nameLabel: "Name",
    passwordHint: "At least 8 characters, with a letter and a number.",
    languageLabel: "Preferred language",
    createAccount: "Create account",
    creatingAccount: "Creating account...",
    alreadyHaveAccount: "Already have an account?",

    yourDocuments: "Your documents",
    askAQuestionHeading: "Ask a question",
    loadingDocuments: "Loading documents...",
    loadingConversation: "Loading conversation...",
    errorLoadDocuments: "Could not load your documents.",
    errorLoadConversation: "Could not load the conversation for this document.",
    errorLoadHistory: "Could not load your history.",
    errorDelete: "Could not delete this document.",
    errorAsk: "Could not get an answer. Please try again.",

    dropText: "Drag & drop a document here, or click to browse",
    fileHint: "PDF, JPG/JPEG, or DOCX — max 15MB",
    uploading: "Uploading and processing your document...",
    uploadErrorGeneric: "Upload failed. Please try again.",

    noDocumentsUploaded: "No documents uploaded yet.",
    statusProcessing: "Processing…",
    statusReady: "Ready",
    statusFailed: "Failed",
    deleteLabel: "Delete",

    composerSrLabel: "Ask a question about this document",
    composerPlaceholderDisabled: "Select a ready document to start asking questions",
    composerPlaceholderEnabled: "e.g. What is the notice period for termination?",
    ask: "Ask",
    asking: "Asking...",

    chatGuidance:
      "Ask a question about this document below. Answers are grounded only in the document's text — if something isn't written there, ClearTerms will say so instead of guessing.",
    foundInDocument: "Found in document",
    notMentioned: "Not mentioned in document",
    viewSourcePassages: "View {n} source passage(s)",
    pageLabel: "Page",

    historyTitle: "History",
    historyEmpty: "You haven't asked any questions yet. Upload a document on the Home tab to get started.",
    deletedDocument: "Deleted document",
    unknownDocument: "Unknown document",
    questionPrefix: "Q:",

    yourProfile: "Your profile",
    saveChanges: "Save changes",
    saving: "Saving...",
    profileUpdated: "Profile updated.",
    profileUpdateError: "Could not save your changes. Please try again.",

    notFoundTitle: "Page not found",
    notFoundSubtitle: "The page you're looking for doesn't exist.",
    goBackHome: "Go back home",
  },

  hi: {
    skipToContent: "मुख्य सामग्री पर जाएँ",
    navHome: "होम",
    navHistory: "इतिहास",
    navYou: "आप",
    navLogout: "लॉग आउट",

    loginTitle: "वापसी पर स्वागत है",
    loginSubtitle: "अपने दस्तावेज़ों के बारे में प्रश्न पूछना जारी रखने के लिए ClearTerms में साइन इन करें।",
    emailLabel: "ईमेल",
    passwordLabel: "पासवर्ड",
    signIn: "साइन इन करें",
    signingIn: "साइन इन हो रहा है...",
    noAccountYet: "अभी तक खाता नहीं है?",
    createOne: "एक बनाएं",

    registerTitle: "अपना खाता बनाएं",
    registerSubtitle: "एक अनुबंध या नीति अपलोड करें और केवल उसमें लिखी बातों पर आधारित सरल भाषा में उत्तर पाएं।",
    nameLabel: "नाम",
    passwordHint: "कम से कम 8 अक्षर, जिसमें एक अक्षर और एक अंक हो।",
    languageLabel: "पसंदीदा भाषा",
    createAccount: "खाता बनाएं",
    creatingAccount: "खाता बनाया जा रहा है...",
    alreadyHaveAccount: "पहले से खाता है?",

    yourDocuments: "आपके दस्तावेज़",
    askAQuestionHeading: "एक प्रश्न पूछें",
    loadingDocuments: "दस्तावेज़ लोड हो रहे हैं...",
    loadingConversation: "बातचीत लोड हो रही है...",
    errorLoadDocuments: "आपके दस्तावेज़ लोड नहीं हो सके।",
    errorLoadConversation: "इस दस्तावेज़ की बातचीत लोड नहीं हो सकी।",
    errorLoadHistory: "आपका इतिहास लोड नहीं हो सका।",
    errorDelete: "यह दस्तावेज़ हटाया नहीं जा सका।",
    errorAsk: "उत्तर नहीं मिल सका। कृपया पुनः प्रयास करें।",

    dropText: "यहाँ एक दस्तावेज़ खींचें और छोड़ें, या ब्राउज़ करने के लिए क्लिक करें",
    fileHint: "PDF, JPG/JPEG, या DOCX — अधिकतम 15MB",
    uploading: "आपका दस्तावेज़ अपलोड और संसाधित हो रहा है...",
    uploadErrorGeneric: "अपलोड विफल रहा। कृपया पुनः प्रयास करें।",

    noDocumentsUploaded: "अभी तक कोई दस्तावेज़ अपलोड नहीं किया गया है।",
    statusProcessing: "संसाधित हो रहा है…",
    statusReady: "तैयार",
    statusFailed: "विफल",
    deleteLabel: "हटाएं",

    composerSrLabel: "इस दस्तावेज़ के बारे में एक प्रश्न पूछें",
    composerPlaceholderDisabled: "प्रश्न पूछना शुरू करने के लिए एक तैयार दस्तावेज़ चुनें",
    composerPlaceholderEnabled: "उदाहरण: समाप्ति के लिए नोटिस अवधि क्या है?",
    ask: "पूछें",
    asking: "पूछा जा रहा है...",

    chatGuidance:
      "नीचे इस दस्तावेज़ के बारे में एक प्रश्न पूछें। उत्तर केवल दस्तावेज़ के पाठ पर आधारित होते हैं — यदि कुछ वहाँ नहीं लिखा है, तो ClearTerms अनुमान लगाने के बजाय ऐसा कहेगा।",
    foundInDocument: "दस्तावेज़ में मिला",
    notMentioned: "दस्तावेज़ में उल्लेख नहीं",
    viewSourcePassages: "{n} स्रोत अंश देखें",
    pageLabel: "पृष्ठ",

    historyTitle: "इतिहास",
    historyEmpty: "आपने अभी तक कोई प्रश्न नहीं पूछा है। शुरू करने के लिए होम टैब पर एक दस्तावेज़ अपलोड करें।",
    deletedDocument: "हटाया गया दस्तावेज़",
    unknownDocument: "अज्ञात दस्तावेज़",
    questionPrefix: "प्रश्न:",

    yourProfile: "आपकी प्रोफ़ाइल",
    saveChanges: "परिवर्तन सहेजें",
    saving: "सहेजा जा रहा है...",
    profileUpdated: "प्रोफ़ाइल अपडेट हो गई।",
    profileUpdateError: "आपके परिवर्तन सहेजे नहीं जा सके। कृपया पुनः प्रयास करें।",

    notFoundTitle: "पृष्ठ नहीं मिला",
    notFoundSubtitle: "आप जिस पृष्ठ की तलाश कर रहे हैं वह मौजूद नहीं है।",
    goBackHome: "होम पर वापस जाएं",
  },

  es: {
    skipToContent: "Saltar al contenido principal",
    navHome: "Inicio",
    navHistory: "Historial",
    navYou: "Tú",
    navLogout: "Cerrar sesión",

    loginTitle: "Bienvenido de nuevo",
    loginSubtitle: "Inicia sesión en ClearTerms para seguir haciendo preguntas sobre tus documentos.",
    emailLabel: "Correo electrónico",
    passwordLabel: "Contraseña",
    signIn: "Iniciar sesión",
    signingIn: "Iniciando sesión...",
    noAccountYet: "¿Aún no tienes una cuenta?",
    createOne: "Crea una",

    registerTitle: "Crea tu cuenta",
    registerSubtitle:
      "Sube un contrato o política y obtén respuestas en lenguaje sencillo basadas únicamente en lo que dice.",
    nameLabel: "Nombre",
    passwordHint: "Al menos 8 caracteres, con una letra y un número.",
    languageLabel: "Idioma preferido",
    createAccount: "Crear cuenta",
    creatingAccount: "Creando cuenta...",
    alreadyHaveAccount: "¿Ya tienes una cuenta?",

    yourDocuments: "Tus documentos",
    askAQuestionHeading: "Haz una pregunta",
    loadingDocuments: "Cargando documentos...",
    loadingConversation: "Cargando conversación...",
    errorLoadDocuments: "No se pudieron cargar tus documentos.",
    errorLoadConversation: "No se pudo cargar la conversación de este documento.",
    errorLoadHistory: "No se pudo cargar tu historial.",
    errorDelete: "No se pudo eliminar este documento.",
    errorAsk: "No se pudo obtener una respuesta. Inténtalo de nuevo.",

    dropText: "Arrastra y suelta un documento aquí, o haz clic para buscar",
    fileHint: "PDF, JPG/JPEG o DOCX — máximo 15 MB",
    uploading: "Subiendo y procesando tu documento...",
    uploadErrorGeneric: "Error al subir. Inténtalo de nuevo.",

    noDocumentsUploaded: "Aún no se ha subido ningún documento.",
    statusProcessing: "Procesando…",
    statusReady: "Listo",
    statusFailed: "Fallido",
    deleteLabel: "Eliminar",

    composerSrLabel: "Haz una pregunta sobre este documento",
    composerPlaceholderDisabled: "Selecciona un documento listo para empezar a preguntar",
    composerPlaceholderEnabled: "p. ej. ¿Cuál es el período de preaviso para la terminación?",
    ask: "Preguntar",
    asking: "Preguntando...",

    chatGuidance:
      "Haz una pregunta sobre este documento a continuación. Las respuestas se basan únicamente en el texto del documento; si algo no está escrito allí, ClearTerms lo dirá en lugar de adivinar.",
    foundInDocument: "Encontrado en el documento",
    notMentioned: "No mencionado en el documento",
    viewSourcePassages: "Ver {n} pasaje(s) de origen",
    pageLabel: "Página",

    historyTitle: "Historial",
    historyEmpty: "Aún no has hecho ninguna pregunta. Sube un documento en la pestaña Inicio para comenzar.",
    deletedDocument: "Documento eliminado",
    unknownDocument: "Documento desconocido",
    questionPrefix: "P:",

    yourProfile: "Tu perfil",
    saveChanges: "Guardar cambios",
    saving: "Guardando...",
    profileUpdated: "Perfil actualizado.",
    profileUpdateError: "No se pudieron guardar tus cambios. Inténtalo de nuevo.",

    notFoundTitle: "Página no encontrada",
    notFoundSubtitle: "La página que buscas no existe.",
    goBackHome: "Volver al inicio",
  },

  fr: {
    skipToContent: "Aller au contenu principal",
    navHome: "Accueil",
    navHistory: "Historique",
    navYou: "Vous",
    navLogout: "Se déconnecter",

    loginTitle: "Content de vous revoir",
    loginSubtitle: "Connectez-vous à ClearTerms pour continuer à poser des questions sur vos documents.",
    emailLabel: "E-mail",
    passwordLabel: "Mot de passe",
    signIn: "Se connecter",
    signingIn: "Connexion en cours...",
    noAccountYet: "Pas encore de compte ?",
    createOne: "Créez-en un",

    registerTitle: "Créez votre compte",
    registerSubtitle:
      "Téléversez un contrat ou une politique et obtenez des réponses en langage simple basées uniquement sur son contenu.",
    nameLabel: "Nom",
    passwordHint: "Au moins 8 caractères, avec une lettre et un chiffre.",
    languageLabel: "Langue préférée",
    createAccount: "Créer un compte",
    creatingAccount: "Création du compte...",
    alreadyHaveAccount: "Vous avez déjà un compte ?",

    yourDocuments: "Vos documents",
    askAQuestionHeading: "Poser une question",
    loadingDocuments: "Chargement des documents...",
    loadingConversation: "Chargement de la conversation...",
    errorLoadDocuments: "Impossible de charger vos documents.",
    errorLoadConversation: "Impossible de charger la conversation de ce document.",
    errorLoadHistory: "Impossible de charger votre historique.",
    errorDelete: "Impossible de supprimer ce document.",
    errorAsk: "Impossible d'obtenir une réponse. Veuillez réessayer.",

    dropText: "Glissez-déposez un document ici, ou cliquez pour parcourir",
    fileHint: "PDF, JPG/JPEG ou DOCX — 15 Mo maximum",
    uploading: "Téléversement et traitement de votre document...",
    uploadErrorGeneric: "Échec du téléversement. Veuillez réessayer.",

    noDocumentsUploaded: "Aucun document téléversé pour le moment.",
    statusProcessing: "Traitement en cours…",
    statusReady: "Prêt",
    statusFailed: "Échec",
    deleteLabel: "Supprimer",

    composerSrLabel: "Poser une question sur ce document",
    composerPlaceholderDisabled: "Sélectionnez un document prêt pour commencer à poser des questions",
    composerPlaceholderEnabled: "ex. Quel est le préavis pour la résiliation ?",
    ask: "Demander",
    asking: "Envoi en cours...",

    chatGuidance:
      "Posez une question sur ce document ci-dessous. Les réponses sont basées uniquement sur le texte du document — si quelque chose n'y est pas écrit, ClearTerms le dira au lieu de deviner.",
    foundInDocument: "Trouvé dans le document",
    notMentioned: "Non mentionné dans le document",
    viewSourcePassages: "Voir {n} passage(s) source",
    pageLabel: "Page",

    historyTitle: "Historique",
    historyEmpty: "Vous n'avez encore posé aucune question. Téléversez un document dans l'onglet Accueil pour commencer.",
    deletedDocument: "Document supprimé",
    unknownDocument: "Document inconnu",
    questionPrefix: "Q :",

    yourProfile: "Votre profil",
    saveChanges: "Enregistrer les modifications",
    saving: "Enregistrement...",
    profileUpdated: "Profil mis à jour.",
    profileUpdateError: "Impossible d'enregistrer vos modifications. Veuillez réessayer.",

    notFoundTitle: "Page introuvable",
    notFoundSubtitle: "La page que vous recherchez n'existe pas.",
    goBackHome: "Retour à l'accueil",
  },

  de: {
    skipToContent: "Zum Hauptinhalt springen",
    navHome: "Start",
    navHistory: "Verlauf",
    navYou: "Du",
    navLogout: "Abmelden",

    loginTitle: "Willkommen zurück",
    loginSubtitle: "Melde dich bei ClearTerms an, um weiterhin Fragen zu deinen Dokumenten zu stellen.",
    emailLabel: "E-Mail",
    passwordLabel: "Passwort",
    signIn: "Anmelden",
    signingIn: "Anmeldung läuft...",
    noAccountYet: "Noch kein Konto?",
    createOne: "Konto erstellen",

    registerTitle: "Konto erstellen",
    registerSubtitle:
      "Lade einen Vertrag oder eine Richtlinie hoch und erhalte einfache Antworten, die ausschließlich auf dem Inhalt basieren.",
    nameLabel: "Name",
    passwordHint: "Mindestens 8 Zeichen, mit einem Buchstaben und einer Zahl.",
    languageLabel: "Bevorzugte Sprache",
    createAccount: "Konto erstellen",
    creatingAccount: "Konto wird erstellt...",
    alreadyHaveAccount: "Bereits ein Konto?",

    yourDocuments: "Deine Dokumente",
    askAQuestionHeading: "Eine Frage stellen",
    loadingDocuments: "Dokumente werden geladen...",
    loadingConversation: "Unterhaltung wird geladen...",
    errorLoadDocuments: "Deine Dokumente konnten nicht geladen werden.",
    errorLoadConversation: "Die Unterhaltung zu diesem Dokument konnte nicht geladen werden.",
    errorLoadHistory: "Dein Verlauf konnte nicht geladen werden.",
    errorDelete: "Dieses Dokument konnte nicht gelöscht werden.",
    errorAsk: "Es konnte keine Antwort abgerufen werden. Bitte versuche es erneut.",

    dropText: "Dokument hierher ziehen oder klicken, um eines auszuwählen",
    fileHint: "PDF, JPG/JPEG oder DOCX — max. 15 MB",
    uploading: "Dein Dokument wird hochgeladen und verarbeitet...",
    uploadErrorGeneric: "Upload fehlgeschlagen. Bitte versuche es erneut.",

    noDocumentsUploaded: "Noch keine Dokumente hochgeladen.",
    statusProcessing: "Wird verarbeitet…",
    statusReady: "Bereit",
    statusFailed: "Fehlgeschlagen",
    deleteLabel: "Löschen",

    composerSrLabel: "Eine Frage zu diesem Dokument stellen",
    composerPlaceholderDisabled: "Wähle ein fertiges Dokument aus, um Fragen zu stellen",
    composerPlaceholderEnabled: "z. B. Wie lange ist die Kündigungsfrist?",
    ask: "Fragen",
    asking: "Wird gefragt...",

    chatGuidance:
      "Stelle unten eine Frage zu diesem Dokument. Antworten basieren ausschließlich auf dem Text des Dokuments — steht dort nichts dazu, sagt ClearTerms das, anstatt zu raten.",
    foundInDocument: "Im Dokument gefunden",
    notMentioned: "Im Dokument nicht erwähnt",
    viewSourcePassages: "{n} Quellenabschnitt(e) anzeigen",
    pageLabel: "Seite",

    historyTitle: "Verlauf",
    historyEmpty: "Du hast noch keine Fragen gestellt. Lade auf der Startseite ein Dokument hoch, um zu beginnen.",
    deletedDocument: "Gelöschtes Dokument",
    unknownDocument: "Unbekanntes Dokument",
    questionPrefix: "F:",

    yourProfile: "Dein Profil",
    saveChanges: "Änderungen speichern",
    saving: "Wird gespeichert...",
    profileUpdated: "Profil aktualisiert.",
    profileUpdateError: "Deine Änderungen konnten nicht gespeichert werden. Bitte versuche es erneut.",

    notFoundTitle: "Seite nicht gefunden",
    notFoundSubtitle: "Die gesuchte Seite existiert nicht.",
    goBackHome: "Zurück zur Startseite",
  },

  pt: {
    skipToContent: "Pular para o conteúdo principal",
    navHome: "Início",
    navHistory: "Histórico",
    navYou: "Você",
    navLogout: "Sair",

    loginTitle: "Bem-vindo de volta",
    loginSubtitle: "Entre no ClearTerms para continuar fazendo perguntas sobre seus documentos.",
    emailLabel: "E-mail",
    passwordLabel: "Senha",
    signIn: "Entrar",
    signingIn: "Entrando...",
    noAccountYet: "Ainda não tem uma conta?",
    createOne: "Crie uma",

    registerTitle: "Crie sua conta",
    registerSubtitle:
      "Envie um contrato ou política e obtenha respostas em linguagem simples, baseadas apenas no que está escrito.",
    nameLabel: "Nome",
    passwordHint: "Pelo menos 8 caracteres, com uma letra e um número.",
    languageLabel: "Idioma preferido",
    createAccount: "Criar conta",
    creatingAccount: "Criando conta...",
    alreadyHaveAccount: "Já tem uma conta?",

    yourDocuments: "Seus documentos",
    askAQuestionHeading: "Fazer uma pergunta",
    loadingDocuments: "Carregando documentos...",
    loadingConversation: "Carregando conversa...",
    errorLoadDocuments: "Não foi possível carregar seus documentos.",
    errorLoadConversation: "Não foi possível carregar a conversa deste documento.",
    errorLoadHistory: "Não foi possível carregar seu histórico.",
    errorDelete: "Não foi possível excluir este documento.",
    errorAsk: "Não foi possível obter uma resposta. Tente novamente.",

    dropText: "Arraste e solte um documento aqui, ou clique para procurar",
    fileHint: "PDF, JPG/JPEG ou DOCX — máximo de 15 MB",
    uploading: "Enviando e processando seu documento...",
    uploadErrorGeneric: "Falha no envio. Tente novamente.",

    noDocumentsUploaded: "Nenhum documento enviado ainda.",
    statusProcessing: "Processando…",
    statusReady: "Pronto",
    statusFailed: "Falhou",
    deleteLabel: "Excluir",

    composerSrLabel: "Fazer uma pergunta sobre este documento",
    composerPlaceholderDisabled: "Selecione um documento pronto para começar a perguntar",
    composerPlaceholderEnabled: "ex.: Qual é o prazo de aviso prévio para rescisão?",
    ask: "Perguntar",
    asking: "Perguntando...",

    chatGuidance:
      "Faça uma pergunta sobre este documento abaixo. As respostas são baseadas apenas no texto do documento — se algo não estiver escrito ali, o ClearTerms dirá isso em vez de adivinhar.",
    foundInDocument: "Encontrado no documento",
    notMentioned: "Não mencionado no documento",
    viewSourcePassages: "Ver {n} trecho(s) de origem",
    pageLabel: "Página",

    historyTitle: "Histórico",
    historyEmpty: "Você ainda não fez nenhuma pergunta. Envie um documento na aba Início para começar.",
    deletedDocument: "Documento excluído",
    unknownDocument: "Documento desconhecido",
    questionPrefix: "P:",

    yourProfile: "Seu perfil",
    saveChanges: "Salvar alterações",
    saving: "Salvando...",
    profileUpdated: "Perfil atualizado.",
    profileUpdateError: "Não foi possível salvar suas alterações. Tente novamente.",

    notFoundTitle: "Página não encontrada",
    notFoundSubtitle: "A página que você procura não existe.",
    goBackHome: "Voltar ao início",
  },

  ar: {
    skipToContent: "الانتقال إلى المحتوى الرئيسي",
    navHome: "الرئيسية",
    navHistory: "السجل",
    navYou: "أنت",
    navLogout: "تسجيل الخروج",

    loginTitle: "مرحبًا بعودتك",
    loginSubtitle: "سجّل الدخول إلى ClearTerms لمتابعة طرح الأسئلة حول مستنداتك.",
    emailLabel: "البريد الإلكتروني",
    passwordLabel: "كلمة المرور",
    signIn: "تسجيل الدخول",
    signingIn: "جارٍ تسجيل الدخول...",
    noAccountYet: "ليس لديك حساب بعد؟",
    createOne: "أنشئ واحدًا",

    registerTitle: "أنشئ حسابك",
    registerSubtitle: "ارفع عقدًا أو سياسة واحصل على إجابات بلغة بسيطة تستند فقط إلى ما هو مكتوب فيه.",
    nameLabel: "الاسم",
    passwordHint: "8 أحرف على الأقل، تتضمن حرفًا ورقمًا.",
    languageLabel: "اللغة المفضلة",
    createAccount: "إنشاء حساب",
    creatingAccount: "جارٍ إنشاء الحساب...",
    alreadyHaveAccount: "لديك حساب بالفعل؟",

    yourDocuments: "مستنداتك",
    askAQuestionHeading: "اطرح سؤالاً",
    loadingDocuments: "جارٍ تحميل المستندات...",
    loadingConversation: "جارٍ تحميل المحادثة...",
    errorLoadDocuments: "تعذر تحميل مستنداتك.",
    errorLoadConversation: "تعذر تحميل محادثة هذا المستند.",
    errorLoadHistory: "تعذر تحميل سجلك.",
    errorDelete: "تعذر حذف هذا المستند.",
    errorAsk: "تعذر الحصول على إجابة. يرجى المحاولة مرة أخرى.",

    dropText: "اسحب وأفلت مستندًا هنا، أو انقر للتصفح",
    fileHint: "PDF أو JPG/JPEG أو DOCX — بحد أقصى 15 ميجابايت",
    uploading: "جارٍ رفع مستندك ومعالجته...",
    uploadErrorGeneric: "فشل الرفع. يرجى المحاولة مرة أخرى.",

    noDocumentsUploaded: "لم يتم رفع أي مستندات بعد.",
    statusProcessing: "قيد المعالجة…",
    statusReady: "جاهز",
    statusFailed: "فشل",
    deleteLabel: "حذف",

    composerSrLabel: "اطرح سؤالاً حول هذا المستند",
    composerPlaceholderDisabled: "اختر مستندًا جاهزًا لبدء طرح الأسئلة",
    composerPlaceholderEnabled: "مثال: ما هي مدة الإشعار المطلوبة لإنهاء العقد؟",
    ask: "اسأل",
    asking: "جارٍ السؤال...",

    chatGuidance:
      "اطرح سؤالاً حول هذا المستند أدناه. تستند الإجابات فقط إلى نص المستند — وإذا لم يُذكر شيء ما فيه، فسيقول ClearTerms ذلك بدلاً من التخمين.",
    foundInDocument: "موجود في المستند",
    notMentioned: "غير مذكور في المستند",
    viewSourcePassages: "عرض {n} مقطع مصدر",
    pageLabel: "صفحة",

    historyTitle: "السجل",
    historyEmpty: "لم تطرح أي أسئلة بعد. ارفع مستندًا من علامة تبويب الرئيسية للبدء.",
    deletedDocument: "مستند محذوف",
    unknownDocument: "مستند غير معروف",
    questionPrefix: "س:",

    yourProfile: "ملفك الشخصي",
    saveChanges: "حفظ التغييرات",
    saving: "جارٍ الحفظ...",
    profileUpdated: "تم تحديث الملف الشخصي.",
    profileUpdateError: "تعذر حفظ تغييراتك. يرجى المحاولة مرة أخرى.",

    notFoundTitle: "الصفحة غير موجودة",
    notFoundSubtitle: "الصفحة التي تبحث عنها غير موجودة.",
    goBackHome: "العودة إلى الرئيسية",
  },

  zh: {
    skipToContent: "跳转到主要内容",
    navHome: "首页",
    navHistory: "历史记录",
    navYou: "我",
    navLogout: "退出登录",

    loginTitle: "欢迎回来",
    loginSubtitle: "登录 ClearTerms，继续询问有关您文档的问题。",
    emailLabel: "电子邮箱",
    passwordLabel: "密码",
    signIn: "登录",
    signingIn: "正在登录...",
    noAccountYet: "还没有账户？",
    createOne: "创建一个",

    registerTitle: "创建您的账户",
    registerSubtitle: "上传合同或政策文件，获取仅基于文档实际内容的简明解答。",
    nameLabel: "姓名",
    passwordHint: "至少 8 个字符，包含一个字母和一个数字。",
    languageLabel: "首选语言",
    createAccount: "创建账户",
    creatingAccount: "正在创建账户...",
    alreadyHaveAccount: "已经有账户了？",

    yourDocuments: "您的文档",
    askAQuestionHeading: "提出问题",
    loadingDocuments: "正在加载文档...",
    loadingConversation: "正在加载对话...",
    errorLoadDocuments: "无法加载您的文档。",
    errorLoadConversation: "无法加载此文档的对话。",
    errorLoadHistory: "无法加载您的历史记录。",
    errorDelete: "无法删除此文档。",
    errorAsk: "无法获取答案，请重试。",

    dropText: "将文档拖放到此处，或点击浏览",
    fileHint: "支持 PDF、JPG/JPEG 或 DOCX — 最大 15MB",
    uploading: "正在上传并处理您的文档...",
    uploadErrorGeneric: "上传失败，请重试。",

    noDocumentsUploaded: "尚未上传任何文档。",
    statusProcessing: "处理中…",
    statusReady: "已就绪",
    statusFailed: "失败",
    deleteLabel: "删除",

    composerSrLabel: "针对此文档提出问题",
    composerPlaceholderDisabled: "请选择一个已就绪的文档以开始提问",
    composerPlaceholderEnabled: "例如：终止合同的通知期是多久？",
    ask: "提问",
    asking: "正在提问...",

    chatGuidance:
      "在下方就此文档提出问题。答案仅基于文档中的文字——如果文档中没有相关内容，ClearTerms 会明确说明，而不会凭空猜测。",
    foundInDocument: "已在文档中找到",
    notMentioned: "文档中未提及",
    viewSourcePassages: "查看 {n} 个来源段落",
    pageLabel: "第",

    historyTitle: "历史记录",
    historyEmpty: "您还没有提出过任何问题。请在首页标签中上传文档以开始使用。",
    deletedDocument: "已删除的文档",
    unknownDocument: "未知文档",
    questionPrefix: "问：",

    yourProfile: "您的个人资料",
    saveChanges: "保存更改",
    saving: "正在保存...",
    profileUpdated: "个人资料已更新。",
    profileUpdateError: "无法保存您的更改，请重试。",

    notFoundTitle: "未找到页面",
    notFoundSubtitle: "您要查找的页面不存在。",
    goBackHome: "返回首页",
  },
};
