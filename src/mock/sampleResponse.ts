import type { AnalyzeResponse } from "../api/types";

export const sampleTanglishResponse: AnalyzeResponse = {
  schema_version: "1.0",
  request_id: "req_mock_tanglish_001",
  mode: "mock",
  input_kind: "solicitation_message",
  text_source: "user_text",
  analysed_text: "Daily 3% guaranteed profit. SEBI registered advisor (Reg: INH000000000). Pay Rs 5000 to rameshadvisor@okaxis",
  language: { detected: "ta_latn", output: "en" },
  tier: {
    level: "several_indicators",
    label: {
      en: "Several risk indicators requiring verification",
      ta: "சரிபார்க்க வேண்டிய பல ஆபத்து அறிகுறிகள்"
    },
    contributing_rule_ids: ["r1", "r2", "r3"]
  },
  ai_notice: null,
  masking: {
    applied: [],
    text_sent_to_ai: false,
    image_sent_to_ai: false
  },
  claims: [
    {
      id: "r1",
      quote: "Daily 3% guaranteed profit",
      span: { start: 0, end: 26 },
      extra_spans: [],
      indicator: {
        id: "assured_return",
        label: {
          en: "Assured or guaranteed return claim",
          ta: "உறுதியான அல்லது உத்தரவாத வருமானக் கூற்று"
        }
      },
      severity: "strong",
      origin: "rule",
      why_it_matters: {
        en: "Guaranteed or unusually certain returns are a strong warning indicator in investment fraud awareness guidance.",
        ta: "உத்தரவாதமான அல்லது அசாதாரணமாக உறுதியான வருமானம் என்பது முதலீட்டு மோசடி விழிப்புணர்வு வழிகாட்டுதல்களில் வலுவான எச்சரிக்கை அறிகுறியாகக் கருதப்படுகிறது."
      },
      verify_through: {
        text: {
          en: "Official investor-awareness guidance from SEBI.",
          ta: "செபியின் அதிகாரப்பூர்வ முதலீட்டாளர் விழிப்புணர்வு வழிகாட்டுதல்."
        },
        route_ids: ["sebi_investor_awareness"]
      },
      limit: {
        en: "This does not by itself prove the sender is acting fraudulently.",
        ta: "இது மட்டுமே அனுப்புநர் மோசடியாகச் செயல்படுகிறார் என்பதை நிரூபிக்காது."
      },
      verifiable_by: "official_source_by_user",
      source_basis: "regulator_guidance",
      detail: null
    },
    {
      id: "r2",
      quote: "rameshadvisor@okaxis",
      span: { start: 88, end: 108 },
      extra_spans: [],
      indicator: {
        id: "payee_handle",
        label: {
          en: "Payment handle requested",
          ta: "பணம் செலுத்த கோரப்பட்ட ஐடி"
        }
      },
      severity: "strong",
      origin: "rule",
      why_it_matters: {
        en: "SEBI has introduced validated UPI handles for registered intermediaries who collect money from investors. This handle does not follow that format. Investors can also pay by bank transfer, so this alone is not proof either way.",
        ta: "முதலீட்டாளர்களிடம் பணம் பெறும் பதிவு பெற்ற இடைத்தரகர்களுக்காக செபி சரிபார்க்கப்பட்ட UPI ஐடிகளை அறிமுகப்படுத்தியுள்ளது. இந்த ஐடி அந்த வடிவில் இல்லை. முதலீட்டாளர்கள் வங்கிப் பரிமாற்றம் மூலமும் செலுத்தலாம்; எனவே இது மட்டும் எதையும் நிரூபிக்காது."
      },
      verify_through: {
        text: {
          en: "SEBI Check, using the UPI ID or the bank account and IFSC.",
          ta: "செபி செக், UPI ஐடி அல்லது வங்கிக் கணக்கு மற்றும் IFSC-ஐப் பயன்படுத்தி."
        },
        route_ids: ["sebi_check"]
      },
      limit: {
        en: "Ruko cannot tell who controls this account. It only compares the handle's format.",
        ta: "இந்தக் கணக்கை யார் இயக்குகிறார் என்பதை ருகோவால் சொல்ல முடியாது. அது ஐடியின் வடிவத்தை மட்டுமே ஒப்பிடுகிறது."
      },
      verifiable_by: "format_check_only",
      source_basis: "regulator_guidance",
      detail: null
    },
    {
      id: "r3",
      quote: "SEBI registered advisor (Reg: INH000000000",
      span: { start: 28, end: 70 },
      extra_spans: [],
      indicator: {
        id: "registration_claim",
        label: {
          en: "Registration claim",
          ta: "பதிவுக் கூற்று"
        }
      },
      severity: "medium",
      origin: "rule",
      why_it_matters: {
        en: "A registration number shown in a message does not by itself establish that the sender owns or is authorized to use it.",
        ta: "செய்தியில் காட்டப்படும் பதிவு எண், அதை அனுப்புநர் வைத்திருக்கிறார் அல்லது பயன்படுத்த அதிகாரம் பெற்றவர் என்பதை மட்டும் நிரூபிக்காது."
      },
      verify_through: {
        text: {
          en: "Official SEBI intermediary and registration records.",
          ta: "செபியின் அதிகாரப்பூர்வ இடைத்தரகர் மற்றும் பதிவுப் பதிவுகள்."
        },
        route_ids: ["sebi_intermediary_search"]
      },
      limit: {
        en: "Ruko cannot establish identity or ownership of the registration number from the message alone.",
        ta: "செய்தியை மட்டும் வைத்து பதிவு எண்ணின் உரிமையையோ அனுப்புநரின் அடையாளத்தையோ ருகோவால் உறுதிப்படுத்த முடியாது."
      },
      verifiable_by: "official_source_by_user",
      source_basis: "regulator_guidance",
      detail: {
        en: "The number has the shape of a SEBI registration number. Ruko only checks the shape, not whether it exists.",
        ta: "இந்த எண் ஒரு செபி பதிவு எண்ணின் வடிவத்தைக் கொண்டுள்ளது. ருகோ வடிவத்தை மட்டுமே சரிபார்க்கிறது, அது உண்மையில் உள்ளதா என்பதல்ல."
      }
    }
  ],
  cannot_verify: [
    {
      id: "cv1",
      text: {
        en: "Whether the person who sent this message is who they say they are.",
        ta: "இந்தச் செய்தியை அனுப்பியவர் தாம் கூறுபவர்தானா என்பதை."
      }
    },
    {
      id: "cv2",
      text: {
        en: "Whether a registration number shown in the message belongs to the sender.",
        ta: "செய்தியில் உள்ள பதிவு எண் அனுப்புநருக்குச் சொந்தமானதா என்பதை."
      }
    },
    {
      id: "cv3",
      text: {
        en: "Whether a payment account or UPI ID is genuine, or who controls it.",
        ta: "ஒரு பணம் செலுத்தும் கணக்கு அல்லது UPI ஐடி உண்மையானதா, அதை யார் இயக்குகிறார் என்பதை."
      }
    },
    {
      id: "cv4",
      text: {
        en: "What a link or app does. Ruko never opens links.",
        ta: "ஒரு இணைப்பு அல்லது செயலி என்ன செய்யும் என்பதை. ருகோ இணைப்புகளைத் திறக்காது."
      }
    },
    {
      id: "cv5",
      text: {
        en: "Whether any investment is good or bad, or whether any promised return will happen. Ruko does not give investment advice.",
        ta: "எந்த முதலீடும் நல்லதா கெட்டதா, வாக்களிக்கப்பட்ட வருமானம் கிடைக்குமா என்பதை. ருகோ முதலீட்டு ஆலோசனை வழங்காது."
      }
    }
  ],
  actions: {
    verification_routes: [
      {
        id: "sebi_check",
        label: { en: "SEBI Check", ta: "செபி செக்" },
        description: {
          en: "Verify registered entity details using UPI ID, bank account, or registration number.",
          ta: "UPI ஐடி, வங்கிக் கணக்கு அல்லது பதிவு எண்ணைப் பயன்படுத்தி பதிவுசெய்த அமைப்பின் விவரங்களைச் சரிபார்க்கவும்."
        },
        url: "https://siportal.sebi.gov.in/intermediary/sebi-check",
        tel: null
      },
      {
        id: "sebi_intermediary_search",
        label: { en: "SEBI Intermediary Search", ta: "செபி இடைத்தரகர் தேடல்" },
        description: {
          en: "Search the official list of registered investment advisers and research analysts.",
          ta: "பதிவுசெய்யப்பட்ட முதலீட்டு ஆலோசகர்கள் மற்றும் ஆராய்ச்சி ஆய்வாளர்களின் அதிகாரப்பூர்வ பட்டியலைத் தேடுங்கள்."
        },
        url: "https://siportal.sebi.gov.in/intermediary/",
        tel: null
      },
      {
        id: "sebi_investor_awareness",
        label: { en: "SEBI Investor Portal", ta: "செபி முதலீட்டாளர் தளம்" },
        description: {
          en: "Read official guidelines on avoiding illegal schemes and unverified claims.",
          ta: "சட்டவிரோத திட்டங்கள் மற்றும் சரிபார்க்கப்படாத கோரிக்கைகளைத் தவிர்ப்பதற்கான அதிகாரப்பூர்வ வழிகாட்டுதல்களைப் படியுங்கள்."
        },
        url: "https://investor.sebi.gov.in/",
        tel: null
      }
    ],
    pause_pact: {
      suggested_hours: 24,
      checklist: [
        {
          id: "chk1",
          text: {
            en: "I have checked the registration number on the official portal.",
            ta: "அதிகாரப்பூர்வ தளத்தில் பதிவு எண்ணைச் சரிபார்த்துவிட்டேன்."
          }
        },
        {
          id: "chk2",
          text: {
            en: "I verified that the payment account matches the registered name.",
            ta: "பணம் செலுத்தும் கணக்கு பதிவு செய்யப்பட்ட பெயருடன் பொருந்துகிறதா என்று சரிபார்த்தேன்."
          }
        },
        {
          id: "chk3",
          text: {
            en: "I did not download any app from an unverified link.",
            ta: "சரிபார்க்கப்படாத இணைப்பிலிருந்து எந்த செயலியையும் பதிவிறக்கம் செய்யவில்லை."
          }
        },
        {
          id: "chk4",
          text: {
            en: "I consulted a trusted contact before taking action.",
            ta: "நடவடிக்கை எடுப்பதற்கு முன் நம்பகமான ஒருவரிடம் ஆலோசித்தேன்."
          }
        }
      ]
    },
    trusted_person_message: {
      en: "I received an investment message that showed risk indicators on Ruko. I am pausing before moving any money. Could you look at it with me?",
      ta: "எனக்கு ஒரு முதலீட்டுச் செய்தி வந்தது. அதில் ருகோவில் ஆபத்து அறிகுறிகள் காட்டப்பட்டன. பணம் அனுப்புவதற்கு முன் நான் இடைநிறுத்துகிறேன். என்னுடன் சேர்ந்து இதைப் பார்க்க முடியுமா?"
    },
    already_paid: {
      steps: [
        {
          id: "step1",
          text: {
            en: "Call the cyber fraud helpline 1930 now. Report as soon as you can.",
            ta: "இணைய மோசடி உதவி எண் 1930-ஐ உடனே அழைக்கவும். எவ்வளவு விரைவாகப் புகாரளிக்கிறீர்களோ அவ்வளவு நல்லது."
          },
          tel: "1930",
          url: null
        },
        {
          id: "step2",
          text: {
            en: "Tell your bank or payment app that you sent money because of a suspected fraud.",
            ta: "சந்தேகத்திற்குரிய மோசடியால் பணம் அனுப்பியதாக உங்கள் வங்கி அல்லது பணம் செலுத்தும் செயலியிடம் தெரிவிக்கவும்."
          },
          tel: null,
          url: null
        },
        {
          id: "step3",
          text: {
            en: "After the call you may get an SMS with an acknowledgement number. Use it to submit full details on the National Cyber Crime Reporting Portal, within the time they state.",
            ta: "அழைப்பிற்குப் பிறகு ஒப்புகை எண்ணுடன் எஸ்எம்எஸ் வரலாம். அவர்கள் குறிப்பிடும் நேரத்திற்குள் அந்த எண்ணைப் பயன்படுத்தி தேசிய இணையக் குற்றப் புகார் தளத்தில் முழு விவரங்களைச் சமர்ப்பிக்கவும்."
          },
          tel: null,
          url: "https://cybercrime.gov.in/"
        },
        {
          id: "step4",
          text: {
            en: "Keep screenshots, the transaction reference, the sender's number or ID and the payment details. Do not delete the chat.",
            ta: "ஸ்கிரீன்ஷாட்கள், பரிவர்த்தனை குறிப்பு எண், அனுப்புநரின் எண் அல்லது ஐடி, பணம் செலுத்திய விவரங்களை வைத்திருங்கள். உரையாடலை நீக்க வேண்டாம்."
          },
          tel: null,
          url: null
        },
        {
          id: "step5",
          text: {
            en: "Be careful with anyone who offers to recover your money for a fee.",
            ta: "கட்டணம் வாங்கிக்கொண்டு உங்கள் பணத்தை மீட்டுத் தருவதாகக் கூறும் எவரிடமும் எச்சரிக்கையாக இருங்கள்."
          },
          tel: null,
          url: null
        }
      ]
    }
  },
  summary: {
    text: {
      en: "This message contains guaranteed return claims, a non-standard UPI handle, and an unverified registration claim. Verify each claim before sending money.",
      ta: "இந்தச் செய்தியில் உத்தரவாதமளிக்கப்பட்ட வருமானக் கூற்றுகள், தரமற்ற UPI ஐடி மற்றும் சரிபார்க்கப்படாத பதிவுக் கூற்று ஆகியவை உள்ளன. பணம் அனுப்பும் முன் ஒவ்வொரு கூற்றையும் சரிபார்க்கவும்."
    },
    source: "template"
  },
  refusal: null,
  warnings: []
};

export const sampleNoneFoundResponse: AnalyzeResponse = {
  schema_version: "1.0",
  request_id: "req_mock_none_002",
  mode: "mock",
  input_kind: "solicitation_message",
  text_source: "user_text",
  analysed_text: "Mutual fund investments are subject to market risks. Read all scheme related documents carefully.",
  language: { detected: "en", output: "en" },
  tier: {
    level: "none_found",
    label: {
      en: "No risk indicators found in rules",
      ta: "விதிகளில் ஆபத்து அறிகுறிகள் எதுவும் காணப்படவில்லை"
    },
    contributing_rule_ids: []
  },
  ai_notice: null,
  masking: { applied: [], text_sent_to_ai: false, image_sent_to_ai: false },
  claims: [],
  cannot_verify: sampleTanglishResponse.cannot_verify,
  actions: sampleTanglishResponse.actions,
  summary: {
    text: {
      en: "Ruko did not find matching risk indicators in its current rules for this text.",
      ta: "இந்த உரைக்கு ருகோவின் தற்போதைய விதிகளில் பொருந்தும் ஆபத்து அறிகுறிகள் எதுவும் காணப்படவில்லை."
    },
    source: "template"
  },
  refusal: null,
  warnings: []
};

export const sampleAdviceRequestResponse: AnalyzeResponse = {
  schema_version: "1.0",
  request_id: "req_mock_advice_003",
  mode: "mock",
  input_kind: "advice_request",
  text_source: "user_text",
  analysed_text: "Which stock should I buy today?",
  language: { detected: "en", output: "en" },
  tier: null,
  ai_notice: null,
  masking: { applied: [], text_sent_to_ai: false, image_sent_to_ai: false },
  claims: [],
  cannot_verify: [],
  actions: null,
  summary: null,
  refusal: {
    en: "Ruko does not provide stock recommendations, investment advice, or buy/sell/hold suggestions. Please consult a SEBI-registered investment adviser.",
    ta: "ருகோ பங்கு பரிந்துரைகள், முதலீட்டு ஆலோசனைகள் அல்லது வாங்குதல்/விற்பனை/வைத்திருத்தல் ஆலோசனைகளை வழங்காது. தயவுசெய்து செபி பதிவு பெற்ற முதலீட்டு ஆலோசகரை அணுகவும்."
  },
  warnings: []
};

export const sampleTamilPitchResponse: AnalyzeResponse = {
  schema_version: "1.0",
  request_id: "req_mock_tamil_004",
  mode: "mock",
  input_kind: "solicitation_message",
  text_source: "user_text",
  analysed_text: "உறுதியான லாபம் தினமும் 3%. யாரிடமும் சொல்ல வேண்டாம். இன்று மட்டும்!",
  language: { detected: "ta", output: "ta" },
  tier: {
    level: "several_indicators",
    label: {
      en: "Several risk indicators requiring verification",
      ta: "சரிபார்க்க வேண்டிய பல ஆபத்து அறிகுறிகள்"
    },
    contributing_rule_ids: ["r1"]
  },
  ai_notice: null,
  masking: { applied: [], text_sent_to_ai: false, image_sent_to_ai: false },
  claims: [
    {
      id: "r1",
      quote: "உறுதியான லாபம் தினமும் 3%",
      span: { start: 0, end: 25 },
      extra_spans: [],
      indicator: {
        id: "assured_return",
        label: {
          en: "Assured or guaranteed return claim",
          ta: "உறுதியான அல்லது உத்தரவாத வருமானக் கூற்று"
        }
      },
      severity: "strong",
      origin: "rule",
      why_it_matters: {
        en: "Guaranteed or unusually certain returns are a strong warning indicator in investment fraud awareness guidance.",
        ta: "உத்தரவாதமான அல்லது அசாதாரணமாக உறுதியான வருமானம் என்பது முதலீட்டு மோசடி விழிப்புணர்வு வழிகாட்டுதல்களில் வலுவான எச்சரிக்கை அறிகுறியாகக் கருதப்படுகிறது."
      },
      verify_through: {
        text: {
          en: "Official investor-awareness guidance from SEBI.",
          ta: "செபியின் அதிகாரப்பூர்வ முதலீட்டாளர் விழிப்புணர்வு வழிகாட்டுதல்."
        },
        route_ids: ["sebi_investor_awareness"]
      },
      limit: {
        en: "This does not by itself prove the sender is acting fraudulently.",
        ta: "இது மட்டுமே அனுப்புநர் மோசடியாகச் செயல்படுகிறார் என்பதை நிரூபிக்காது."
      },
      verifiable_by: "official_source_by_user",
      source_basis: "regulator_guidance",
      detail: null
    }
  ],
  cannot_verify: sampleTanglishResponse.cannot_verify,
  actions: sampleTanglishResponse.actions,
  summary: {
    text: {
      en: "This message contains guaranteed return claims.",
      ta: "இந்தச் செய்தியில் உத்தரவாதமளிக்கப்பட்ட வருமானக் கூற்றுகள் உள்ளன."
    },
    source: "template"
  },
  refusal: null,
  warnings: []
};
