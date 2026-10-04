import pytest
from app.pipeline.analyze import run_analysis_pipeline
from app.schemas import AnalyzeRequest
from app.ai.base import NullProvider

@pytest.mark.asyncio
async def test_advice_request_detection():
    req = AnalyzeRequest(
        text="Which stocks should I buy today for quick profit?",
        ui_language="en",
        allow_ai=True,
    )
    res = await run_analysis_pipeline(req, ai_provider=NullProvider())

    assert res.input_kind == "advice_request"
    assert res.tier is None
    assert res.actions is None
    assert res.summary is None
    assert res.claims == []
    assert res.refusal is not None
    assert "Ruko does not recommend what to buy" in res.refusal.en
    assert "ருகோ பரிந்துரைக்காது" in res.refusal.ta

@pytest.mark.asyncio
async def test_unreadable_input():
    req = AnalyzeRequest(
        text="   \n\n\u200b   ",
        ui_language="en",
        allow_ai=False,
    )
    res = await run_analysis_pipeline(req, ai_provider=NullProvider())

    assert res.input_kind == "unreadable"
    assert res.tier is None
    assert res.claims == []
    assert res.actions is None
    assert res.refusal is None
