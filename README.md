# BOSTARTER
The platform allows the creation of hardware or software projects to be funded, with a budget and a deadline. Users can contribute by receiving non-monetary rewards. It is possible to apply for the development of software projects based on the required skills. Comments are also supported.

# CONFIGURATION
You will need a configuration file for the connection to MongoDB and MySQL. 
In the Backend folder, create a "config.php" file if you don't already have it.
It should look like this:

```php
<?php
$host = "";
$dbname = "";
$user = "";
$pass = "";

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Connection error: " . $e->getMessage());
}

require __DIR__ . '/../vendor/autoload.php'; #Import if you're using Docker and Composer

$mongo_host = ''; 
$mongo_port = ''; 
$mongo_database = ''; 

try {
    $mongoClient = new MongoDB\Client("mongodb://$mongo_host:$mongo_port");
    $mongoDb = $mongoClient->$mongo_database;
} catch (Exception $e) {
    die("MongoDB connection failed: " . $e->getMessage());
}
?>

```
# USING DOCKER 
If you are executing the Apache server in a Docker environment, be sure to add the dependencies to your DockerFile, in order to let docker use mongoDB and PHP. Your DockerFile should look like this:

```DockerFile
FROM php:8.2-apache 

RUN apt-get update && apt-get install -y \
    libssl-dev \
    && pecl install mongodb \
    && docker-php-ext-enable mongodb
```

You will also need to install MongoDB library for PHP by Composer. Execute these commands in your project folder to install the library: 

```Bash
docker exec -it {YOUR_SERVER} bash
cd /var/www/html
composer require mongodb/mongodb
exit
```
Then, use your Docker Compose file to build Docker.
If everything is set up correctly, you should be able to connect to MongoDB. 
In this project, MongoDB is used to log information every time data is added to the relational database. To verify that everything is working correctly, add some data and check MongoDB to ensure the system is tracking the logs properly.
