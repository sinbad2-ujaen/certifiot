
<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]



<!-- PROJECT LOGO -->
<br />
<div align="center">

  <h1 align="center">CertifIoT</h1>

  <p align="center">
    CertifIoT is a novel DLT-based solution for certifying data from IoT ecosystems. It extends the Phonendo Framework with the Identity module which, implements the additional features required for data certification. We have also proposed an adaptable and extensible data model, along with a protocol for trust endorsement.
    <br />
    <br />
    <a href="https://github.com/sinbad2-ujaen/phonendo">Phonendo</a>
    ·
    <a href="https://github.com/sinbad2-ujaen/certifiot/issues">Report Bug / Request Feature</a>
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

[![Phonendo][product-screenshot]](https://github.com/sinbad2-ujaen/certifiot)

CertifIoT is a system for certifying data from IoT streams. CertifIoT extends Phonendo's architecture (https://github.com/sinbad2-ujaen/phonendo) with the required modules to enable data certification.

The main extension is the development of the module called Identity, which is responsible for the following tasks:

- Identity management: The process involves using the organisation's public key to build a transaction with the CertifIoT identity structure and publishing it on the data registry with an index that allows retrieval of the published data.

- Trust endorsement. Allowing entities involved in the process to endorse each other. This provides confidence and robustness to the data published by an endorsed organisation.

- Data retrieval. Retrieving all data published on IOTA by a given organisation. This includes the organisation's identity, the entities who endorsed the given organisation, and all data published by all of the organisation's devices.

<!-- GETTING STARTED -->
## Getting Started

### Prerequisites

This is an example of how to list things you need to use the software and how to install them.
* npm
  ```sh
  npm install npm@latest -g
  ```

* pm2
  ```sh
  npm install -g pm2
  ```

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/sinbad2-ujaen/certifiot.git
   ```
2. Install NPM packages
   ```sh
   npm install
   ```
3. Start project
   ```sh
   npm run infra:up
   ```



<!-- USAGE EXAMPLES -->
## Usage

- To start the project
   ```sh
   npm run infra:up
   ```
- To stop the project
   ```sh
   npm run infra:down
   ```
- To clean all resources
   ```sh
   npm run infra:clean
   ```
- To restart all services
   ```sh
   npm run infra:restart
   ```

Once all services are up, next step is to register a device using the Reader endpoint
``` 
curl --location 'http://127.0.0.1:3003/register' \ --header 'Content-Type: application/x-www-form-urlencoded' \ --data-urlencode 'device=XXXXXXXXXX' \ --data-urlencode 'serialNumber=XXX' \ --data-urlencode 'deviceType=SMARTWATCH'
```

Once the device is registered, CertifIoT will automatically detect, connect and start listening events. In particular, it captures heartbeat events.

<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request



<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE.txt` for more information.



<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/sinbad2-ujaen/certifiot.svg?style=for-the-badge
[contributors-url]: https://github.com/sinbad2-ujaen/certifiot/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/sinbad2-ujaen/certifiot.svg?style=for-the-badge
[forks-url]: https://github.com/sinbad2-ujaen/certifiot/network/members
[stars-shield]: https://img.shields.io/github/stars/sinbad2-ujaen/certifiot.svg?style=for-the-badge
[stars-url]: https://github.com/sinbad2-ujaen/certifiot/stargazers
[issues-shield]: https://img.shields.io/github/issues/sinbad2-ujaen/certifiot.svg?style=for-the-badge
[issues-url]: https://github.com/sinbad2-ujaen/certifiot/issues
[license-shield]: https://img.shields.io/github/license/sinbad2-ujaen/certifiot.svg?style=for-the-badge
[license-url]: https://github.com/sinbad2-ujaen/certifiot/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://www.linkedin.com/in/francisco-moya/
[product-screenshot]: images/system.jpg