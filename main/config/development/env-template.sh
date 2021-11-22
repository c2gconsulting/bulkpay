# This .sh file will be sourced before starting your application.
# You can use it to put environment variables you want accessible
# to the server side of your app by using process.env.MY_VAR
#
# Example:
# export MONGO_URL="mongodb://localhost:27017/myapp-development"
# export ROOT_URL="http://localhost:3000"
# export KADIRA_ID=""
# export KADIRA_SECRET=""

# default
export MONGO_URL="mongodb://localhost:27017/meteor"
export ROOT_URL="dev.example.com:3000"


# cluster env vars
export CLUSTER_DISCOVERY_URL="mongodb://localhost/service-discovery"
export CLUSTER_SERVICE="main"
export CLUSTER_PUBLIC_SERVICES="main, search"

# aws env vars
export AWS_ACCESS_KEY_ID=""
export AWS_SECRET_ACCESS_KEY=""

# service env vars
export RABBIT_URL="amqp://localhost"

# intercom env vars
export INTERCOM_APP_ID=""
export INTERCOM_APP_SECRET=""
export INTERCOM_APIKEY=""

# base auth env vars
export BASE_ADMIN_PASS=""

# redis env vars
export REDIS_HOST=""
export REDIS_PORT="6379"

# other service env vars
export ROOT_URL=""
export MAIL_URL=""
export AWS_S3_BUCKET=""
export MAIL_SITE_NAME="TradeDepot™"
export MAIL_FROM="TradeDepot™ Team <no-reply@tradedepot.co>"
export JWT_SECRET=""

export MAILGUN_DOMAIN=""
export MAILGUN_API_KEY=""
export MAILGUN_HOST=api.mailgun.net
export TRAVEL_REQUEST_EXTERNAL_NOTIFICATION2="travel_request_external_notification2"
export TRAVEL_REQUEST_NOTIFICATION2=travel_request_notification2
export TRAVEL_RETIREMENT_NOTIFICATION2=travel_retirement_notification2