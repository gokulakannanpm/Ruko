import socket
from unittest.mock import patch
import pytest
from app.pipeline.rules_engine import run_pattern_rules
from app.pipeline.extractors import run_extractors
from app.pipeline.analyze import run_analysis_pipeline
from app.schemas import AnalyzeRequest
from app.ai.base import NullProvider

def test_negation_guards():
    # Negated examples that should NOT fire assured_return
    r1 = run_pattern_rules("no guaranteed returns in stock market")
    assert not any(x["indicator_id"] == "assured_return" for x in r1)

    r2 = run_pattern_rules("returns are not guaranteed here")
    assert not any(x["indicator_id"] == "assured_return" for x in r2)

    r3 = run_pattern_rules("guarantee illa sir")
    assert not any(x["indicator_id"] == "assured_return" for x in r3)

    # Positive example that SHOULD fire assured_return
    r4 = run_pattern_rules("guaranteed profit, risk illa")
    assert any(x["indicator_id"] == "assured_return" for x in r4)

def test_tamil_and_tanglish_rules():
    # Tamil assured return
    r_ta = run_pattern_rules("உறுதியான லாபம் மற்றும் நிச்சயம் லாபம்")
    assert any(x["indicator_id"] == "assured_return" for x in r_ta)

    # Tanglish group access
    r_tg = run_pattern_rules("group la join pannunga vip tips venum")
    assert any(x["indicator_id"] == "private_group_access" for x in r_tg)

def test_registration_extractor():
    text = "SEBI registered advisor (Reg: INH000000000)"
    exts = run_extractors(text)
    reg_matches = [x for x in exts if x["indicator_id"] == "registration_claim"]
    assert len(reg_matches) == 1
    assert "INH000000000" in reg_matches[0]["quote"]
    assert "detail" in reg_matches[0]

def test_payee_handle_context_requirement():
    # Without investment context: payment handle should NOT fire
    text1 = "Pay Rs 500 to ramesh@okaxis"
    exts1 = run_extractors(text1)
    assert not any(x["indicator_id"] == "payee_handle" for x in exts1)

    # With BOTH payment and investment context: payee_handle fires
    text2 = "Invest in stock trading. Pay Rs 5000 to rameshadvisor@okaxis"
    exts2 = run_extractors(text2)
    assert any(x["indicator_id"] == "payee_handle" for x in exts2)

def test_payee_handle_valid_format():
    text = "Invest in mutual fund. Pay fee to advisor@valid"
    exts = run_extractors(text)
    assert any(x["indicator_id"] == "payee_handle_valid_format" for x in exts)

def test_risky_link_flags():
    # APK flag
    exts1 = run_extractors("Download app from http://example.com/app.apk")
    link_claims1 = [x for x in exts1 if x["indicator_id"] == "risky_link"]
    assert len(link_claims1) == 1
    assert link_claims1[0]["severity"] == "strong"

    # Lookalike flag
    exts2 = run_extractors("Visit http://sebi-verification.com/login")
    link_claims2 = [x for x in exts2 if x["indicator_id"] == "risky_link"]
    assert len(link_claims2) == 1
    assert link_claims2[0]["severity"] == "strong"

    # Shortener flag
    exts3 = run_extractors("Click http://bit.ly/3xYz12")
    link_claims3 = [x for x in exts3 if x["indicator_id"] == "risky_link"]
    assert len(link_claims3) == 1
    assert link_claims3[0]["severity"] == "medium"

@pytest.mark.asyncio
async def test_no_outbound_network_or_dns():
    # Patch socket.getaddrinfo to raise an error if any DNS lookup occurs
    with patch("socket.getaddrinfo", side_effect=RuntimeError("DNS resolution prohibited")):
        req = AnalyzeRequest(
            text="Check http://sebi-fake.com/invest and http://bit.ly/xyz. Pay Rs 5000 for profit tips to trader@ybl",
            ui_language="en",
            allow_ai=False,
        )
        res = await run_analysis_pipeline(req, ai_provider=NullProvider())
        assert res.mode == "rules_only"
        assert len(res.claims) > 0
