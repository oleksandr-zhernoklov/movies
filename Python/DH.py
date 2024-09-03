import requests
from lxml import etree
import csv

# Print function for logging
def log_message(message):
    print(message)

start_id = 20000
end_id = 23360
step = 10
base_url = "https://www.dragonheir.info/heroes/"

def scrape_hero_page(hero_id):
    url = f"{base_url}{hero_id}"
    response = requests.get(url)
    if response.status_code == 200:
        page = etree.HTML(response.content)

        # Extract hero name
        hero_name = page.xpath("//h4[@class='text-white']/text()")
        hero_name = hero_name[0].strip() if hero_name else "Unknown"
        
        # Extract hero type
        hero_type = page.xpath("//h5[@class='text-secondary mb-3']/text()")
        hero_type = hero_type[0].strip() if hero_type else "Unknown"

        # Extract additional attributes (e.g., Range, Legendary, etc.)
        attributes = page.xpath("//div[@class='col-lg-9 col-7 pl-1 pb-0']//span[@class='badge badge-primary']/text()")
        attr_columns = [attr.strip() for attr in attributes if attr.strip()]

        # Extract stats
        stats = {}
        stat_divs = page.xpath("//div[contains(@class, 'd-flex')]")
        for stat_div in stat_divs:
            stat_name = stat_div.xpath("./div[@class='text-right py-2']/text()")[0].strip().replace("：", "")
            stat_value = stat_div.xpath("./div[@class='py-2']/text()")
            stat_value = stat_value[0].strip() if stat_value else ""
            stats[stat_name] = stat_value
        
        # Extract subtitles
        subtitles = {}
        subtitle_divs = page.xpath("//div[@class='card-body px-3 pt-0']//div[@role='group']//input[@type='range']")
        for i, subtitle_div in enumerate(subtitle_divs, start=1):
            subtitle_text = subtitle_div.getparent().xpath(".//div[@class='input-group-text']/text()")
            subtitle_text = subtitle_text[0].strip() if subtitle_text else f"Subtitle {i}"
            subtitles[f"Subtitle_{i}"] = subtitle_text

        # Extract hero's attributes when range control is set to 100
        range_controls = page.xpath("//input[@type='range'][@max='100']")
        for control in range_controls:
            range_text = control.getparent().xpath(".//div[@class='input-group-text']/text()")
            range_text = range_text[0].strip() if range_text else "Unknown"
            stats['Range Control Text'] = range_text

        # Combine hero data into one dictionary
        hero_data = {
            'ID': hero_id,
            'Hero Name': hero_name,
            'Hero Type': hero_type,
        }

        # Add the additional attributes as separate columns
        for i, attr in enumerate(attr_columns, start=1):
            hero_data[f'Attribute_{i}'] = attr

        # Add the stats and subtitles to the hero data
        hero_data.update(stats)
        hero_data.update(subtitles)

        # Log the extracted data
        log_message(f"Extracted data: {hero_data}")
        
        return hero_data
    else:
        log_message(f"Failed to retrieve data for hero ID: {hero_id}")
        return None

all_hero_data = []
for hero_id in range(start_id, end_id + step, step):
    hero_data = scrape_hero_page(hero_id)
    if hero_data:
        all_hero_data.append(hero_data)

# Prepare the fieldnames for the CSV
fieldnames = ['ID', 'Hero Name', 'Hero Type']
max_attrs = max(len(hero_data) - len(fieldnames) for hero_data in all_hero_data)
for i in range(1, max_attrs + 1):
    fieldnames.append(f'Attribute_{i}')

# Add dynamic fields
dynamic_fields = set()
for hero_data in all_hero_data:
    dynamic_fields.update(hero_data.keys())

# Sort and add dynamic fields to the fieldnames
for field in sorted(dynamic_fields - set(fieldnames)):
    fieldnames.append(field)

# Save data to CSV
csv_file = 'heroes_data.csv'
with open(csv_file, mode='w', newline='', encoding='utf-8') as file:
    writer = csv.DictWriter(file, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(all_hero_data)

log_message(f"Scraping completed. Total heroes scraped: {len(all_hero_data)}")
log_message(f"Data saved to {csv_file}")
