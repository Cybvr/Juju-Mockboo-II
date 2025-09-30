---
title: Authentication
hide-feedback: true
---

## API Keys

The ElevenLabs API uses API keys for authentication. Every request to the API must include your API key, used to authenticate your requests and track usage quota.

Each API key can be scoped to one of the following:

1. **Scope restriction:** Set access restrictions by limiting which API endpoints the key can access.
2. **Credit quota:** Define custom credit limits to control usage.

**Remember that your API key is a secret.** Do not share it with others or expose it in any client-side code (browsers, apps).

All API requests should include your API key in an `xi-api-key` HTTP header as follows:

```bash
xi-api-key: ELEVENLABS_API_KEY
```

### Making requests

You can paste the command below into your terminal to run your first API request. Make sure to replace `$ELEVENLABS_API_KEY` with your secret API key.

```bash
curl 'https://api.elevenlabs.io/v1/models' \
  -H 'Content-Type: application/json' \
  -H 'xi-api-key: $ELEVENLABS_API_KEY'
```

Example with the `elevenlabs` Python package:

```python
from elevenlabs.client import ElevenLabs

elevenlabs = ElevenLabs(
  api_key='YOUR_API_KEY',
)
```

Example with the `elevenlabs` Node.js package:

```javascript
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

const elevenlabs = new ElevenLabsClient({
  apiKey: 'YOUR_API_KEY',
});
```


Create speech
POST

https://api.elevenlabs.io
/v1/text-to-speech/:voice_id

Example 1

Example 1
POST
/v1/text-to-speech/:voice_id

TypeScript

import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
const client = new ElevenLabsClient({ apiKey: "YOUR_API_KEY" });
await client.textToSpeech.convert("JBFqnCBsd6RMkjVDRZzb", {
    outputFormat: "mp3_44100_128",
    text: "The first move is what sets everything in motion.",
    modelId: "eleven_multilingual_v2"
});
Try it
Converts text into speech using a voice of your choice and returns audio.
Path parameters
voice_id
string
Required
ID of the voice to be used. Use the Get voices endpoint list all the available voices.

Headers
xi-api-key
string
Required
Query parameters
enable_logging
boolean
Optional
Defaults to true
When enable_logging is set to false zero retention mode will be used for the request. This will mean history features are unavailable for this request, including request stitching. Zero retention mode may only be used by enterprise customers.

optimize_streaming_latency
integer or null
Optional
Deprecated
You can turn on latency optimizations at some cost of quality. The best possible final latency varies by model. Possible values: 0 - default mode (no latency optimizations) 1 - normal latency optimizations (about 50% of possible latency improvement of option 3) 2 - strong latency optimizations (about 75% of possible latency improvement of option 3) 3 - max latency optimizations 4 - max latency optimizations, but also with text normalizer turned off for even more latency savings (best latency, but can mispronounce eg numbers and dates).

Defaults to None.

output_format
enum
Optional
Defaults to mp3_44100_128
Output format of the generated audio. Formatted as codec_sample_rate_bitrate. So an mp3 with 22.05kHz sample rate at 32kbs is represented as mp3_22050_32. MP3 with 192kbps bitrate requires you to be subscribed to Creator tier or above. PCM with 44.1kHz sample rate requires you to be subscribed to Pro tier or above. Note that the μ-law format (sometimes written mu-law, often approximated as u-law) is commonly used for Twilio audio inputs.


Show 19 enum values
Request
This endpoint expects an object.
text
string
Required
The text that will get converted into speech.
model_id
string
Optional
Defaults to eleven_multilingual_v2
Identifier of the model that will be used, you can query them using GET /v1/models. The model needs to have support for text to speech, you can check this using the can_do_text_to_speech property.

language_code
string or null
Optional
Language code (ISO 639-1) used to enforce a language for the model and text normalization. If the model does not support provided language code, an error will be returned.

voice_settings
object or null
Optional
Voice settings overriding stored settings for the given voice. They are applied only on the given request.

Show 5 properties
pronunciation_dictionary_locators
list of objects or null
Optional
A list of pronunciation dictionary locators (id, version_id) to be applied to the text. They will be applied in order. You may have up to 3 locators per request


Show 2 properties
seed
integer or null
Optional
If specified, our system will make a best effort to sample deterministically, such that repeated requests with the same seed and parameters should return the same result. Determinism is not guaranteed. Must be integer between 0 and 4294967295.
previous_text
string or null
Optional
The text that came before the text of the current request. Can be used to improve the speech's continuity when concatenating together multiple generations or to influence the speech's continuity in the current generation.
next_text
string or null
Optional
The text that comes after the text of the current request. Can be used to improve the speech's continuity when concatenating together multiple generations or to influence the speech's continuity in the current generation.
previous_request_ids
list of strings or null
Optional
A list of request_id of the samples that were generated before this generation. Can be used to improve the speech’s continuity when splitting up a large task into multiple requests. The results will be best when the same model is used across the generations. In case both previous_text and previous_request_ids is send, previous_text will be ignored. A maximum of 3 request_ids can be send.

next_request_ids
list of strings or null
Optional
A list of request_id of the samples that come after this generation. next_request_ids is especially useful for maintaining the speech’s continuity when regenerating a sample that has had some audio quality issues. For example, if you have generated 3 speech clips, and you want to improve clip 2, passing the request id of clip 3 as a next_request_id (and that of clip 1 as a previous_request_id) will help maintain natural flow in the combined speech. The results will be best when the same model is used across the generations. In case both next_text and next_request_ids is send, next_text will be ignored. A maximum of 3 request_ids can be send.

apply_text_normalization
enum
Optional
Defaults to auto
This parameter controls text normalization with three modes: ‘auto’, ‘on’, and ‘off’. When set to ‘auto’, the system will automatically decide whether to apply text normalization (e.g., spelling out numbers). With ‘on’, text normalization will always be applied, while with ‘off’, it will be skipped. For ‘eleven_turbo_v2_5’ and ‘eleven_flash_v2_5’ models, text normalization can only be enabled with Enterprise plans.

Allowed values:
auto
on
off
apply_language_text_normalization
boolean
Optional
Defaults to false
This parameter controls language text normalization. This helps with proper pronunciation of text in some supported languages. WARNING: This parameter can heavily increase the latency of the request. Currently only supported for Japanese.

use_pvc_as_ivc
boolean
Optional
Defaults to false
Deprecated
If true, we won't use PVC version of the voice for the generation but the IVC version. This is a temporary workaround for higher latency in PVC versions.
Response
The generated audio file


ENDPOINTS
Voices
List voices
GET

https://api.elevenlabs.io
/v2/voices

Example 1

Example 1
GET
/v2/voices

TypeScript

import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
async function main() {
    const client = new ElevenLabsClient({
        environment: "https://api.elevenlabs.io",
    });
    await client.voices.search({});
}
main();
Try it
200
Retrieved

{
  "voices": [
    {
      "voice_id": "string",
      "name": "string",
      "samples": [
        {
          "sample_id": "string",
          "file_name": "string",
          "mime_type": "string",
          "size_bytes": 1,
          "hash": "string",
          "duration_secs": 1.1,
          "remove_background_noise": true,
          "has_isolated_audio": true,
          "has_isolated_audio_preview": true,
          "speaker_separation": {
            "voice_id": "string",
            "sample_id": "string",
            "status": "not_started",
            "speakers": {},
            "selected_speaker_ids": [
              "string"
            ]
          },
          "trim_start": 1,
          "trim_end": 1
        }
      ],
      "category": "generated",
      "fine_tuning": {
        "is_allowed_to_fine_tune": true,
        "state": {},
        "verification_failures": [
          "string"
        ],
        "verification_attempts_count": 1,
        "manual_verification_requested": true,
        "language": "string",
        "progress": {},
        "message": {},
        "dataset_duration_seconds": 1.1,
        "verification_attempts": [
          {
            "text": "string",
            "date_unix": 1,
            "accepted": true,
            "similarity": 1.1,
            "levenshtein_distance": 1.1,
            "recording": {
              "recording_id": "string",
              "mime_type": "string",
              "size_bytes": 1,
              "upload_date_unix": 1,
              "transcription": "string"
            }
          }
        ],
        "slice_ids": [
          "string"
        ],
        "manual_verification": {
          "extra_text": "string",
          "request_time_unix": 1,
          "files": [
            {
              "file_id": "string",
              "file_name": "string",
              "mime_type": "string",
              "size_bytes": 1,
              "upload_date_unix": 1
            }
          ]
        },
        "max_verification_attempts": 1,
        "next_max_verification_attempts_reset_unix_ms": 1,
        "finetuning_state": null
      },
      "labels": {},
      "description": "string",
      "preview_url": "string",
      "available_for_tiers": [
        "string"
      ],
      "settings": {
        "stability": 0.5,
        "use_speaker_boost": true,
        "similarity_boost": 0.5,
        "style": 0,
        "speed": 1
      },
      "sharing": {
        "status": "enabled",
        "history_item_sample_id": "string",
        "date_unix": 1,
        "whitelisted_emails": [
          "string"
        ],
        "public_owner_id": "string",
        "original_voice_id": "string",
        "financial_rewards_enabled": true,
        "free_users_allowed": true,
        "live_moderation_enabled": true,
        "rate": 1.1,
        "fiat_rate": 1.1,
        "notice_period": 1,
        "disable_at_unix": 1,
        "voice_mixing_allowed": true,
        "featured": true,
        "category": "generated",
        "reader_app_enabled": true,
        "image_url": "string",
        "ban_reason": "string",
        "liked_by_count": 1,
        "cloned_by_count": 1,
        "name": "string",
        "description": "string",
        "labels": {},
        "review_status": "not_requested",
        "review_message": "string",
        "enabled_in_library": true,
        "instagram_username": "string",
        "twitter_username": "string",
        "youtube_username": "string",
        "tiktok_username": "string",
        "moderation_check": {
          "date_checked_unix": 1,
          "name_value": "string",
          "name_check": true,
          "description_value": "string",
          "description_check": true,
          "sample_ids": [
            "string"
          ],
          "sample_checks": [
            1.1
          ],
          "captcha_ids": [
            "string"
          ],
          "captcha_checks": [
            1.1
          ]
        },
        "reader_restricted_on": [
          {
            "resource_type": "read",
            "resource_id": "string"
          }
        ]
      },
      "high_quality_base_model_ids": [
        "string"
      ],
      "verified_languages": [
        {
          "language": "string",
          "model_id": "string",
          "accent": "string",
          "locale": "string",
          "preview_url": "string"
        }
      ],
      "safety_control": "NONE",
      "voice_verification": {
        "requires_verification": true,
        "is_verified": true,
        "verification_failures": [
          "string"
        ],
        "verification_attempts_count": 1,
        "language": "string",
        "verification_attempts": [
          {
            "text": "string",
            "date_unix": 1,
            "accepted": true,
            "similarity": 1.1,
            "levenshtein_distance": 1.1,
            "recording": {
              "recording_id": "string",
              "mime_type": "string",
              "size_bytes": 1,
              "upload_date_unix": 1,
              "transcription": "string"
            }
          }
        ]
      },
      "permission_on_resource": "string",
      "is_owner": true,
      "is_legacy": false,
      "is_mixed": false,
      "favorited_at_unix": 1,
      "created_at_unix": 1
    }
  ],
  "has_more": true,
  "total_count": 1,
  "next_page_token": "string"
}
Gets a list of all available voices for a user with search, filtering and pagination.
Headers
xi-api-key
string
Required
Query parameters
next_page_token
string or null
Optional
The next page token to use for pagination. Returned from the previous request.
page_size
integer
Optional
Defaults to 10
How many voices to return at maximum. Can not exceed 100, defaults to 10. Page 0 may include more voices due to default voices being included.
search
string or null
Optional
Search term to filter voices by. Searches in name, description, labels, category.
sort
string or null
Optional
Which field to sort by, one of ‘created_at_unix’ or ‘name’. ‘created_at_unix’ may not be available for older voices.

sort_direction
string or null
Optional
Which direction to sort the voices in. 'asc' or 'desc'.
voice_type
string or null
Optional
Type of the voice to filter by. One of ‘personal’, ‘community’, ‘default’, ‘workspace’, ‘non-default’. ‘non-default’ is equal to all but ‘default’.

category
string or null
Optional
Category of the voice to filter by. One of 'premade', 'cloned', 'generated', 'professional'
fine_tuning_state
string or null
Optional
State of the voice’s fine tuning to filter by. Applicable only to professional voices clones. One of ‘draft’, ‘not_verified’, ‘not_started’, ‘queued’, ‘fine_tuning’, ‘fine_tuned’, ‘failed’, ‘delayed’

collection_id
string or null
Optional
Collection ID to filter voices by.
include_total_count
boolean
Optional
Defaults to true
Whether to include the total count of voices found in the response. Incurs a performance cost.
voice_ids
list of strings or null
Optional
Voice IDs to lookup by. Maximum 100 voice IDs.
Response
Successful Response
voices
list of objects

Show 21 properties
has_more
boolean
total_count
integer
next_page_token
string or null
