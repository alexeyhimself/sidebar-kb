const GEMINI_API_KEY = undefined;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
const GEMINI_API_TIMEOUT = 5000; // do not wait for a response longer than 5 seconds
var available_ai_platforms = {};


async function check_availability_of_gemini_nano_ai() {
  if (!window.ai)
    return;

  try {
    const session = await window.ai.createTextSession();
    available_ai_platforms["gemini_nano"] = true;
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
    const session = await window.ai.createTextSession();
    const question = `We have a page title: "${payload.title}" on URL: "${payload.link}". \
                      And we want to compose meaningful tags for this page. \
                      Advise several tags (at least 3, at most 10) that mostly (but not necessary) \
                      made of the words used in these title and URL. \
                      Return only array of comma separated tags as a response.`;
    let answer = await session.prompt(question);
    //console.log(answer);
    answer = answer.replace(/\[|\]/g, '');  // if we ask for a "comma separated list only" then anything could be in return (; separated, \n- separated, etc). So, by now we ask for an array, but remove []
    if (answer.split(",").length == 1) {  // sometimes returns non-comma separated lists, or only 1 tag (1) which is indistinguishable, and (2) we asked at least 3 tags, not 1 -- so we reject it
      console.warn(`Gemini Nano AI replied with unacceptable output: ${answer}`);
      return [];
    }

    const result = answer.split(",").map(function(item) {
      return item.trim().replaceAll(`"`, ``).toLowerCase();  // we remove " because sometimes it returns tags in "
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