# impinj-reader-provisioner

Provisions one or more readers for a single ItemSense instance. Will provision multiple readers at a time and takes approximately 2-3 minutes to complete each batch.

## Table of Contents

- [Requirements](#requirements)
- [Usage](#usage)
- [Build Executable](#build-executable)
- [Command Line Options](#command-line-options)
- [Instruction File](#instruction-file)
- [Obtaining ItemSense Requirements](#obtaining-requirements)

## Requirements

- ItemSense server instance running
- ItemSense server cap file
- ItemSense ReaderAgent token
- ItemSense server SSL certificate
- Reader definitions created for all readers requiring provisioning
- Readers must be able to communicate with the ItemSense server at the time of provisioning

## Usage

NodeJS

```bash
git clone https://github.com/rledford/impinj-reader-provisioner
cd ./impinj-reader-provisioner
npm i
npm run build

# run the application and check if all readers are available
node ./dist -i /path/to/instruction/file

# run the application and provision the readers if all readers are available
nodde ./dist -i /path/to/instruction/file -p

# run the applicaiton and force provisioning even if one or more readers is not available
node ./dist -i /path/to/instruction/file -f -p
```

## Build Executables

### Windows Example

Assuming NodeJS 8.x is being used.

Install [pkg](https://www.npmjs.com/package/pkg) package globally.

```bash
npm i -g pkg
```

Download source, build, and package into executable.

```bash
git clone https://github.com/rledford/impinj-reader-provisioner
cd ./impinj-reader-provisioner
npm i
npm run build
pkg .\dist\index.js -t node8-win -o C:\Users\username\Desktop\impinj-reader-provisioner.exe
```

See [pkg](https://www.npmjs.com/package/pkg) documentation for more build options.

## Command Line Options

| Option  | Alias | Description                                |
| ------- | ----- | ------------------------------------------ |
| --ifile | -i    | The path to an instruction file (required) |

## Instruction File

The instruction file uses key value pairs to define the provisioning instructions and should include the following:

| Key                | Value Example                        | Description                                                                                                                                                                                                                                           |
| ------------------ | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ITEMSENSE_HOST     | 192.168.1.100                        | The hostname or IP address of the ItemSense server (whichever one the readers need to use to communicate with the server).                                                                                                                            |
| ITEMSENSE_CAP      | /path/to/cap/file.cap                | The path to the ItemSense ii-cap-x.x.x.xxx-xxx.upg file.                                                                                                                                                                                              |
| ITEMSENSE_CERT     | /path/to/cert/file.pem               | The path to an ItemSense server SSL certificate file in PEM format.                                                                                                                                                                                   |
| READER_AGENT_TOKEN | 6fc52ba8-a2b7-44cb-b779-255064610d5f | The token the readers should use to autheticate with the ItemSense server                                                                                                                                                                             |
| READER_BATCH_SIZE  | 5                                    | The number of readers to provision at the same time. This does not need to be equal to the number of readers in the instruction file. Defaults to 5.                                                                                                  |
| READER             | name,ip,username,password            | Comma separated values for a reader's name, IP address, username, and password. Only the name and IP address are required unless the reader's username and password are not the default `root:impinj`. Multiple READER entries may exist in the file. |

Example Instruction File

```txt
# this is a comment
# comments are ignored
ITEMSENSE_HOST=192.168.1.100
ITEMSENSE_CAP=/path/to/ii-cap-x.x.x.xxx-xxx.upg
ITEMSENSE_CERT=/path/to/itemsense-cert.pem
READER_AGENT_TOKEN=6fc52ba8-a2b7-44cb-b779-255064610d5f
READER_BATCH_SIZE=10
READER=SpeedwayR-FF-FF-10,192.168.1.10
READER=SpeedwayR-FF-FF-11,192.168.1.11,notroot,notimpinj
READER=SpeedwayR-FF-FF-12,192.168.1.12
READER=SpeedwayR-FF-FF-13,192.168.1.13
READER=SpeedwayR-FF-FF-14,192.168.1.14,notroot,notimpinj
READER=SpeedwayR-FF-FF-15,192.168.1.15
READER=SpeedwayR-FF-FF-16,192.168.1.16
READER=SpeedwayR-FF-FF-17,192.168.1.17,username,password
READER=SpeedwayR-FF-FF-18,192.168.1.18
# this is another comment
```

_NOTE_: The order of the instructions in the file does not matter.

_NOTE_: Duplicate reader names and IP addresses are not allowed.

_TIP_: If provisioning fails on some of the readers, use `#` to comment out the `READER`s that were successfully provisioned and rerun this tool with the modified instruction file.

## Obtaining ItemSense Requirements

### Cap File

Assuming a standard ItemSense install, the ii-cap-x.x.x.xxx-xxx.upg file needed for provisioning can be found in the following directory:

```bash
/opt/impinj/itemsense/<version>/containers/itemsense/binaries/cap_itemsense
```

Transfer the cap file to the machine that will run this tool to provision the readers.

### ReaderAgent Token

_IMPORTANT_: If the ItemSense server has never provisioned at least one reader automatically, it is likely that the _ReaderAgent_ user does not exist.

Access the ItemSense Swagger web interface to perform the next steps.

ItemSense Swagger URL

_http://itemsense-base-url/swagger_

Example

_http://192.168.1.100:80/itemsense/swagger_

_NOTE_: When prompted to enter a username and password, while executing the steps below, provide the `admin` user's credentials to ensure the actions execute with sufficient privileges.

---

**STEP 1**

Under _v1 Authentication_, expand the _GET /configuration/v1/users/show_ operation. Click the _Try it out!_ button. If the _ReaderAgent_ user is not in the list, then it will have to be created (see _Step 1.1_).

---

**STEP 1.1**

**Only If the Previous Step Did Not Return a ReaderAgent User**

Under _v1 Authentication_, expand the _POST /configuration/v1/users/create_ operation and add the following to the body parameter (use a secure password):

```json
{
  "name": "ReaderAgent",
  "password": "use-a-secure-password",
  "roles": ["ReaderAgent"]
}
```

Under _v1 Authentication_, expand the _PUT /authentication/v1/token/{username}_ operation

Enter _ReaderAgent_ for the _username_ parameter. Click the _Try it out!_ button. Copy the token. Skip the next step (Step 2) since the token has already been acquired.

---

**STEP 2**

Under _v1 Authentication_, expand the _GET /authentication/v1/listTokens/{username}_ operation. Enter _ReaderAgent_ for the _username_ parameter. Click the _Try it out!_ button. Copy the _authenticationToken.token_ value in the response body.

```json
[
  {
    "authenticationToken": {
      "token": "6fc52ba8-a2b7-44cb-b779-255064610d5f"
    },
    "issued": "2020-01-01T00:00:00.000Z",
    "username": "ReaderAgent",
    "valid": true,
    "lastUsed": "2020-01-01T00:00:00.000Z"
  }
]
```

---

### SSL Certificate

Either directly access the server's command line or use SSH to run the following command:

```bash
openssl s_client -showcerts -connect itemsense-server-ip-or-hostname:443 </dev/null 2>/dev/null|openssl x509 -outform PEM >ItemSense.pem
```

- Replace `itemsense-server-ip-or-hostname` with the server's IP address or hostname.
- Replace `ItemSense.pem` with a desired file name. Something with a date, time, and the ItemSense version is usually helpful for tracking upgrades.
- Copy the file to the machine that will be used to provision the readers.

### Reader Definitions

Use the ItemSense Management Console to create reader definitions for the readers that will be provisioned with this tool.

http://itemsense-ip:3010/readers/definitions

_NOTE_: The reader name format should match exactly with `SpeedwayR-XX-XX-XX` where _XX-XX-XX_ is the last 3 segments of the reader's MAC address.

## Additional Information

- Sometimes readers take longer than 90 seconds to fully boot and ready themselves for HTTP connections so it's possible that after a successful CAP file upload and restart that the reader will fail to provision. You can comment out the readers that successfully provisioned in your instruction file and rerun this tool to attempt to provision the failed readers. You could also edit the source code and increase the wait time. The wait time constant can be found in the _ImpinjReaderProvision.ts_ file.

```js
const READER_RESTART_WAIT_TIME = 90000; // change this value if necessary (milliseconds)
```
