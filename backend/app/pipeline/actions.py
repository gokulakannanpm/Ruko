from app.schemas import (
    Actions, Route, PausePactObj, ChecklistItem, AlreadyPaidObj, StepItem,
    CannotVerifyItem, SummaryObj, L10n, Claim, TierLevel
)
from app.pipeline.copy import get_copy_manager

ROUTE_ORDER: list[str] = [
    "sebi_check",
    "sebi_intermediary_search",
    "sebi_investor_awareness",
    "ncrp_portal",
    "sanchar_saathi",
]

DEFAULT_NONE_FOUND_ROUTES: list[str] = [
    "sebi_check",
    "sebi_intermediary_search",
    "sebi_investor_awareness",
]

PAUSE_CHECKLIST: list[ChecklistItem] = [
    ChecklistItem(
        id="p1",
        text=L10n(
            en="I have not been told to keep this secret from my family.",
            ta="இதை என் குடும்பத்தினரிடம் மறைக்கும்படி எனக்குச் சொல்லப்படவில்லை."
        )
    ),
    ChecklistItem(
        id="p2",
        text=L10n(
            en="I have checked the registration claim and the payment account through an official route.",
            ta="பதிவுக் கூற்றையும் பணம் செலுத்தும் கணக்கையும் அதிகாரப்பூர்வ வழியில் சரிபார்த்தேன்."
        )
    ),
    ChecklistItem(
        id="p3",
        text=L10n(
            en="I can explain, in my own words, what I am paying for and what I will receive.",
            ta="நான் எதற்காகப் பணம் செலுத்துகிறேன், என்ன பெறுவேன் என்பதை என் சொந்த வார்த்தைகளில் விளக்க முடியும்."
        )
    ),
    ChecklistItem(
        id="p4",
        text=L10n(
            en="I have told someone I trust about this message.",
            ta="இந்தச் செய்தியைப் பற்றி நம்பகமான ஒருவரிடம் சொன்னேன்."
        )
    ),
]

ALREADY_PAID_STEPS: list[StepItem] = [
    StepItem(
        id="s1",
        text=L10n(
            en="Call the cyber fraud helpline 1930 now. Report as soon as you can.",
            ta="இணைய மோசடி உதவி எண் 1930-ஐ உடனே அழைக்கவும். எவ்வளவு விரைவாகப் புகாரளிக்கிறீர்களோ அவ்வளவு நல்லது."
        ),
        tel="tel:1930",
        url=None,
    ),
    StepItem(
        id="s2",
        text=L10n(
            en="Tell your bank or payment app that you sent money because of a suspected fraud.",
            ta="சந்தேகத்திற்குரிய மோசடியால் பணம் அனுப்பியதாக உங்கள் வங்கி அல்லது பணம் செலுத்தும் செயலியிடம் தெரிவிக்கவும்."
        ),
        tel=None,
        url=None,
    ),
    StepItem(
        id="s3",
        text=L10n(
            en="After the call you may get an SMS with an acknowledgement number. Use it to submit full details on the National Cyber Crime Reporting Portal, within the time they state.",
            ta="அழைப்பிற்குப் பிறகு ஒப்புகை எண்ணுடன் எஸ்எம்எஸ் வரலாம். அவர்கள் குறிப்பிடும் நேரத்திற்குள் அந்த எண்ணைப் பயன்படுத்தி தேசிய இணையக் குற்றப் புகார் தளத்தில் முழு விவரங்களைச் சமர்ப்பிக்கவும்."
        ),
        tel=None,
        url="https://cybercrime.gov.in/",
    ),
    StepItem(
        id="s4",
        text=L10n(
            en="Keep screenshots, the transaction reference, the sender's number or ID and the payment details. Do not delete the chat.",
            ta="ஸ்கிரீன்ஷாட்கள், பரிவர்த்தனை குறிப்பு எண், அனுப்புநரின் எண் அல்லது ஐடி, பணம் செலுத்திய விவரங்களை வைத்திருங்கள். உரையாடலை நீக்க வேண்டாம்."
        ),
        tel=None,
        url=None,
    ),
    StepItem(
        id="s5",
        text=L10n(
            en="Be careful with anyone who offers to recover your money for a fee.",
            ta="கட்டணம் வாங்கிக்கொண்டு உங்கள் பணத்தை மீட்டுத் தருவதாகக் கூறும் எவரிடமும் எச்சரிக்கையாக இருங்கள்."
        ),
        tel=None,
        url=None,
    ),
]

CANNOT_VERIFY_ITEMS: list[CannotVerifyItem] = [
    CannotVerifyItem(
        id="cv1",
        text=L10n(
            en="Whether the person who sent this message is who they say they are.",
            ta="இந்தச் செய்தியை அனுப்பியவர் தாம் கூறுபவர்தானா என்பதை."
        )
    ),
    CannotVerifyItem(
        id="cv2",
        text=L10n(
            en="Whether a registration number shown in the message belongs to the sender.",
            ta="செய்தியில் உள்ள பதிவு எண் அனுப்புநருக்குச் சொந்தமானதா என்பதை."
        )
    ),
    CannotVerifyItem(
        id="cv3",
        text=L10n(
            en="Whether a payment account or UPI ID is genuine, or who controls it.",
            ta="ஒரு பணம் செலுத்தும் கணக்கு அல்லது UPI ஐடி உண்மையானதா, அதை யார் இயக்குகிறார் என்பதை."
        )
    ),
    CannotVerifyItem(
        id="cv4",
        text=L10n(
            en="What a link or app does. Ruko never opens links.",
            ta="ஒரு இணைப்பு அல்லது செயலி என்ன செய்யும் என்பதை. ருகோ இணைப்புகளைத் திறக்காது."
        )
    ),
    CannotVerifyItem(
        id="cv5",
        text=L10n(
            en="Whether any investment is good or bad, or whether any promised return will happen. Ruko does not give investment advice.",
            ta="எந்த முதலீடும் நல்லதா கெட்டதா, வாக்களிக்கப்பட்ட வருமானம் கிடைக்குமா என்பதை. ருகோ முதலீட்டு ஆலோசனை வழங்காது."
        )
    ),
]

TEMPLATE_SUMMARIES: dict[TierLevel, L10n] = {
    "several_indicators": L10n(
        en="Ruko found several risk indicators in this message. Each one is a claim that needs checking through an official route before any money is sent. Ruko cannot tell whether the sender is genuine.",
        ta="இந்தச் செய்தியில் ருகோ பல ஆபத்து அறிகுறிகளைக் கண்டறிந்தது. பணம் அனுப்பும் முன் ஒவ்வொன்றும் அதிகாரப்பூர்வ வழியில் சரிபார்க்கப்பட வேண்டிய கூற்று. அனுப்புநர் உண்மையானவரா என்பதை ருகோவால் சொல்ல முடியாது."
    ),
    "some_indicators": L10n(
        en="Ruko found some risk indicators in this message. They are claims worth checking through an official route before money is sent. Ruko cannot tell whether the sender is genuine.",
        ta="இந்தச் செய்தியில் ருகோ சில ஆபத்து அறிகுறிகளைக் கண்டறிந்தது. பணம் அனுப்பும் முன் அவற்றை அதிகாரப்பூர்வ வழியில் சரிபார்க்கத் தகும். அனுப்புநர் உண்மையானவரா என்பதை ருகோவால் சொல்ல முடியாது."
    ),
    "none_found": L10n(
        en="Ruko's rules found no risk indicators in this message. That does not mean the message is trustworthy. Ruko cannot verify the sender, accounts or links.",
        ta="ருகோவின் விதிகள் இந்தச் செய்தியில் எந்த ஆபத்து அறிகுறியையும் காணவில்லை. இதன் பொருள் செய்தி நம்பத்தக்கது என்பதல்ல. அனுப்புநர், கணக்குகள் அல்லது இணைப்புகளை ருகோவால் சரிபார்க்க முடியாது."
    )
}

def build_actions(rule_claims: list[Claim], tier_level: TierLevel) -> Actions:
    copy_mgr = get_copy_manager()

    # Collect referenced route IDs in order
    referenced: set[str] = set()
    for claim in rule_claims:
        if claim.origin == "rule":
            for rid in claim.verify_through.route_ids:
                referenced.add(rid)

    selected_route_ids: list[str] = []
    if tier_level == "none_found" or not referenced:
        selected_route_ids = list(DEFAULT_NONE_FOUND_ROUTES)
    else:
        for rid in ROUTE_ORDER:
            if rid in referenced:
                selected_route_ids.append(rid)

    verification_routes: list[Route] = []
    for rid in selected_route_ids:
        rdata = copy_mgr.get_route(rid)
        if rdata:
            verification_routes.append(Route(
                id=rdata["id"],
                label=L10n(**rdata["label"]),
                description=L10n(**rdata["description"]),
                url=rdata.get("url"),
                tel=rdata.get("tel"),
            ))

    # Trusted person message
    rule_indicator_labels_en: list[str] = []
    rule_indicator_labels_ta: list[str] = []

    seen_indicators: set[str] = set()
    for claim in rule_claims:
        if claim.origin == "rule" and claim.indicator.id not in seen_indicators:
            seen_indicators.add(claim.indicator.id)
            rule_indicator_labels_en.append(claim.indicator.label.en)
            rule_indicator_labels_ta.append(claim.indicator.label.ta)

    if rule_indicator_labels_en:
        labels_str_en = ", ".join(rule_indicator_labels_en)
        labels_str_ta = ", ".join(rule_indicator_labels_ta)
        trusted_msg = L10n(
            en=f"I received a message asking me to pay money for an investment. A checking tool called Ruko marked these points that need verification: {labels_str_en}. I have not paid anything. Can you help me check this before I decide?",
            ta=f"முதலீட்டிற்காகப் பணம் செலுத்தச் சொல்லி எனக்கு ஒரு செய்தி வந்தது. ருகோ என்ற சரிபார்ப்புக் கருவி இந்தக் குறிப்புகளைச் சரிபார்க்க வேண்டியவை என்று குறித்தது: {labels_str_ta}. நான் இன்னும் எதுவும் செலுத்தவில்லை. முடிவு செய்வதற்கு முன் இதைச் சரிபார்க்க உதவ முடியுமா?"
        )
    else:
        trusted_msg = L10n(
            en="I received a message about an investment and want to check it before paying. Can you look at it with me?",
            ta="முதலீடு பற்றிய ஒரு செய்தி வந்தது; பணம் செலுத்தும் முன் அதைச் சரிபார்க்க விரும்புகிறேன். என்னுடன் சேர்ந்து பார்க்க முடியுமா?"
        )

    return Actions(
        verification_routes=verification_routes,
        pause_pact=PausePactObj(suggested_hours=24, checklist=PAUSE_CHECKLIST),
        trusted_person_message=trusted_msg,
        already_paid=AlreadyPaidObj(steps=ALREADY_PAID_STEPS),
    )

def build_template_summary(tier_level: TierLevel) -> SummaryObj:
    return SummaryObj(
        text=TEMPLATE_SUMMARIES[tier_level],
        source="template"
    )
