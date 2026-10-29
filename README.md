# ASKANI KAASHIDHOO — Dharus & Workshop Records

Dhivehi (RTL) site listing the NGO's dharus and workshops.

## Adding a record

Edit `data/records.json` and add an entry:

```json
{
  "id": "2026-11-05-example",
  "type": "dharus",
  "title": "ދަރުހުގެ ނަން",
  "arabic": "optional Arabic text",
  "date": "2026-11-05",
  "time": "20:30",
  "place": "ތަން",
  "speaker": "ދެއްވި ފަރާތް",
  "topic": "މައުޟޫޢު",
  "participants": 40,
  "description": "ތަފްޞީލު",
  "notes": "ނޯޓް"
}
```

- `type`: `dharus` or `workshop`
- `date`: `YYYY-MM-DD`
- `id`: any unique text
- Only `id`, `type`, `title` and `date` are required.

## Fonts

- Thaana: MV Funa (Regular, Bold) and MV Funa Black for headings — in `fonts/`
- Arabic: Amiri (Google Fonts)
