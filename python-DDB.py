import boto3
import csv
from botocore.exceptions import ClientError

# Create a DynamoDB client
dynamodb = boto3.client('dynamodb', region_name='us-east-1')

# Define the table name
table_name = 'VideoMetadata'

# Define the table schema
table_schema = [
    {
        'AttributeName': 'File',
        'AttributeType': 'S'
    },
    {
        'AttributeName': 'Year',
        'AttributeType': 'N'
    }
]

# Define the table key schema
key_schema = [
    {
        'AttributeName': 'File',
        'KeyType': 'HASH'
    },
    {
        'AttributeName': 'Year',
        'KeyType': 'RANGE'
    }
]

# Define the provisioned throughput
provisioned_throughput = {
    'ReadCapacityUnits': 5,
    'WriteCapacityUnits': 5
}

# Create the DynamoDB table
try:
    dynamodb.create_table(
        TableName=table_name,
        AttributeDefinitions=table_schema,
        KeySchema=key_schema,
        ProvisionedThroughput=provisioned_throughput
    )
    print(f"Table {table_name} created successfully.")
except ClientError as e:
    if e.response['Error']['Code'] == 'ResourceInUseException':
        print(f"Table {table_name} already exists.")
    else:
        print(f"Error creating table: {e}")

# Wait for the table to be created
waiter = dynamodb.get_waiter('table_exists')
waiter.wait(TableName=table_name)

# Read successful results from CSV file
with open('successful_results.csv', 'r', encoding='utf-8') as csv_file:
    reader = csv.DictReader(csv_file)
    successful_results = list(reader)


# Replicate successful results to DynamoDB
for result in successful_results:
    item = {
        'File': {'S': result['File']},
        'Year': {'N': result['Year']},
        'Title': {'S': result['Title']},
        'Genre': {'SS': result['Genre'].split(', ')},
        'TMDB ID': {'N': result['TMDB ID']},
        'Length': {'N': result['Length']},
        'TMDB Link': {'S': result['TMDB Link']},
        'Description': {'S': result['Description']},
        'Rating': {'N': result['Rating']},
        'Toloka Link': {'S': result['Toloka Link']},
        'Rutracker Link': {'S': result['Rutracker Link']},
        'Poster': {'S': result['Poster']},
        'Trailer': {'S': result['Trailer']},
        'File_gb': {'N': result['File_gb']}
    }

    try:
        dynamodb.put_item(TableName=table_name, Item=item)
        print(f"Item added to DynamoDB: {result['File']}")
    except ClientError as e:
        print(f"Error adding item to DynamoDB: {e}")
