var available_ai_platforms = {};


async function try_ai_gemini_nano() {
  try {
    const session = await window.ai.createTextSession();
    available_ai_platforms["gemini_nano"] = true;
  } 
  catch {
    // console.warn("Gemini Nano AI is not available. ");
  }
}

async function try_ai_gemini(key) {
  fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({"contents":[{"parts":[{"text": "Hi"}]}]}),
    signal: AbortSignal.timeout(5000),
  })
  .then((response) => response.json())
  .then((data) => {
    if (data.error) {
      // console.warn("Gemini AI is not available. ");
      return;
    }

    available_ai_platforms["gemini"] = true;
  });
}

async function fill_available_ai_platforms_dict() {
  await try_ai_gemini_nano();
  if ("gemini" in available_ai_platforms || "gemini_nano" in available_ai_platforms)
    document.getElementById("ai_status").style.display = '';

  // try_ai_gemini("API key here");
}

async function ask_ai_gemini_nano(p) {
  //console.log("asking Gemini Nano AI");
  const session = await window.ai.createTextSession();
  const question = `We have a page title: "${p.title}" on URL: "${p.link}". And we want to compose meaningful tags for this page. Advise several tags that mostly made of the words used in this title. Return a comma separated list only as a response.`;
  //console.log(question)
  const answer = await session.prompt(question);
  //console.log(answer);
  //if (answer)
  //  console.log(answer.split(",").map(function(item) {return item.trim();}));
  const result = answer.split(",").map(function(item) {
    return item.trim().toLowerCase();
  });
  return result;
}

async function ask_ai(payload, ai_type) {
  if (!ai_type)  // default to Gemini Nano
    ai_type = "gemini_nano";

  // if (ai_type == "gemini" && available_ai_platforms[ai_type])
  //  return ask_ai_gemini(payload);

  if (available_ai_platforms[ai_type])
    return await ask_ai_gemini_nano(payload);

  return;
}