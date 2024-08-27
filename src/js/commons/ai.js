/************************************************ DOCS *************************************************
 * Gemini Nano AI: https://docs.google.com/document/d/1VG8HIyz361zGduWgNG7R_R8Xkv0OOJ8b5C9QKeCjU0c/edit
 * Gemini AI: https://ai.google.dev
 *******************************************************************************************************/

const GEMINI_API_KEY = undefined;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
const GEMINI_API_TIMEOUT = 5000; // do not wait for a response longer than 5 seconds
var available_ai_platforms = {};


async function check_availability_of_gemini_nano_ai() {
  if (!ai)
    return;

  try {
    // (await ai.assistant.capabilities()).available == "readily";
    const session = await ai.assistant.create();
    available_ai_platforms["gemini_nano"] = true;
    session.destroy();
  } 
  catch (error) {
    console.warn(`Gemini Nano AI is not available due to an error: ${error}`);
  }
}

async function check_availability_of_gemini_ai(api_key) {
  if (!api_key)
    return;

  fetch(`${GEMINI_API_URL}?key=${api_key}`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({"contents":[{"parts":[{"text": "Hi"}]}]}),
    signal: AbortSignal.timeout(GEMINI_API_TIMEOUT),
  })
  .then((response) => response.json())
  .then((data) => {
    if (data.error) {
      console.warn(`Gemini AI is not available due to an error: ${data.error}`);
      return;
    }

    available_ai_platforms["gemini"] = true;
  });
}

function display_ai_availability_icon() {
  if ("gemini" in available_ai_platforms || "gemini_nano" in available_ai_platforms)
    document.getElementById("ai_status").style.display = 'inline';
}

async function check_available_ai_platforms() {
  await check_availability_of_gemini_nano_ai();
  await check_availability_of_gemini_ai(GEMINI_API_KEY);

  display_ai_availability_icon();
}

async function ask_ai_gemini_nano(payload) {
  try {
    const session = await ai.assistant.create();
    const question = `On URL: "${payload.link}" we have a webpage titled: "${payload.title}". \
                      And we want to compose meaningful tags for this webpage. \
                      Advise several tags (at least 3, at most 10) that mostly (but not necessarily) \
                      made of the words used in these title and resource. \
                      Each tag could be made of 1 or 2 words only. \
                      Each tag could be only a noun. Do not use adjectives for tags. \
                      Do not offer neither URL value nor "URL" as a tag. \
                      Do not use hypen to concatenate several words as 1 tag. \
                      Do not concatenate several words without spaces as 1 tag. \
                      Do not offer "URL" or "Title" as tags. \
                      Return only array of comma separated tags as a response.`;
    let answer = await session.prompt(question);
    session.destroy();

    console.log(answer);
    answer = answer.replace(/\[|\]|```json|```|- /g, '');  // if we ask for a "comma separated list only" then anything could be in return (; separated, \n- separated, etc). So, by now we ask for an array, but remove []
    answer = answer.replace(/\n/g, ',');
    if (answer.split(",").length == 1) {  // sometimes returns non-comma separated lists, or only 1 tag (1) which is indistinguishable, and (2) we asked at least 3 tags, not 1 -- so we reject it
      console.warn(`Gemini Nano AI replied with unacceptable output: ${answer}`);
      return [];
    }

    const result_candidate = answer.split(",").map(function(item) {
      let tag_candidate = item.trim().replaceAll(`_`, ` `).replace(/"|”|“|'/g, '').toLowerCase();  // sometimes it returns tags in ", sometimes with _
      if (tag_candidate.length < 20 && tag_candidate.length > 0)  // still returns "Sure! Here are 8 relevant tags for the given ..."
        return tag_candidate;
    });

    let result = [];
    result_candidate.forEach((tag) => {  // removing undefined tags
      if (tag)
        result.push(tag);
    });

    return result;
  }
  catch (error) {
    console.warn(`Gemini Nano AI call ended up with an error: ${error}`);
    return [];
  }
}

async function ask_ai_gemini(payload) {
  return [];
}

async function ask_ai(payload, ai_platform) {
  if (!ai_platform)  // default to Gemini Nano
    ai_platform = "gemini_nano";

  if (!available_ai_platforms[ai_platform])
    return [];

  if (ai_platform == "gemini_nano")
    return await ask_ai_gemini_nano(payload);
  else if (ai_platform == "gemini")
    return await ask_ai_gemini(payload);
  else
    return [];
}