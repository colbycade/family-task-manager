The public elastic IP address for our web app is `52.3.100.168`
### To `ssh` into web server: 
`ssh -i "~/Desktop/BYU/CS260/wrightsaretough.pem" ubuntu@52.3.100.168` (or `ubuntu@familytracker.click`)

The domain name for the website is [familytracker.click](http://familytracker.click).  
Any subdomains also redirect, such as [example.familytracker.click](http://example.familytracker.click).

### To deploy:
`./deployReact.sh -k ~/Desktop/BYU/CS260/wrightsaretough.pem -h familytracker.click -s startup`

## Technologies
The toolchain that we use for our React project consists of GitHub as the code repository, Vite for JSX, TS, development and debugging support, ESBuild for converting to ES6 modules and transpiling (with Babel underneath), Rollup for bundling and tree shaking, PostCSS for CSS transpiling, and finally a simple bash script (deployReact.sh) for deployment.


# Notes for final exam

## The Web

### The Internet

📖 **Deeper dive reading**:

- [MDN How does the Internet work?](https://developer.mozilla.org/en-US/docs/Learn/Common_questions/How_does_the_Internet_work)
- [YouTube The Internet in 5 Minutes](https://youtu.be/7_LPdttKXPc)

The internet globally connects independent networks and computing devices. In a simplistic way, you can think of the **internet** as a massive redundant collection of wires that connect up all the computers in the world. A lot of those wires are wireless (wiFi, satellite, or cell), and not all of computers in the world are connected, but generally that is what the internet is.

![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/dd9295af-0b67-4b6a-ae14-8f9db23fb67b/7d866eb1-4a56-4f03-b1be-8d0a5574b831/Untitled.png)

### Making Connections

When one device wants to talk to another it must have an Internet Protocol (**IP**) **address**. For example, `128.187.16.184` is BYU's address. Usually, human users prefer a symbolic name over an IP address. The symbolic name is called a **domain name**. Domain names are converted to IP address by doing a lookup in the Domain Name System (DNS). You can look up the IP address for any domain name using the `**dig**` console utility.

```bash
-> dig byu.edu

byu.edu.		5497	IN	A	128.187.16.184
```

Once you have the IP address, you connect to the device it represents by first asking for a connection route to the device. A connection route consists of many hops across the network until the destination is dynamically discovered and the connection established. With the connection the transport and application layers start exchanging data.

### Traceroute

You can determine the hops in a connection using the `**traceroute**` console utility. 

```bash
➜  traceroute byu.edu

traceroute to byu.edu (128.187.16.184), 64 hops max, 52 byte packets
 1  192.168.1.1 (192.168.1.1)  10.942 ms  4.055 ms  4.694 ms
 2  * * *
 3  * * *
 4  192-119-18-212.mci.googlefiber.net (192.119.18.212)  5.369 ms  5.576 ms  6.456 ms
 5  216.21.171.197 (216.21.171.197)  6.283 ms  6.767 ms  5.532 ms
 6  * * *
 7  * * *
 8  * * *
 9  byu.com (128.187.16.184)  7.544 ms !X *  40.231 ms !X
```

If traceroute were run again, we might see a slightly different route since every connection through the internet is dynamically calculated. The ability to discover a route makes the internet resilient when network devices fail or disappear from the network.

### Network Internals

The actual sending of data across the internet uses the **TCP/IP** model. This is a layered architecture that covers everything from the physical wires to the data that a web application sends. 

At the top of the TCP/IP protocol is the **application** layer. It represents user functionality, such as the web (HTTP), mail (SMTP), files (FTP), remote shell (SSH), and chat (IRC). 

Underneath that is the **transport** layer which breaks the application layer's information into small chunks and sends the data. 

The actual connection is made using the **internet** layer. This finds the device you want to talk to and keeps the connection alive. 

Finally, at the bottom of the model is the **link** layer which deals with the physical connections and hardware.

| Layer | Example | Purpose |
| --- | --- | --- |
| Application | HTTPS | Functionality like web browsing |
| Transport | TCP | Moving connection information packets |
| Internet | IP | Establishing connections |
| Link | Fiber, hardware | Physical connections |

### Web Servers

A **web server** is a computing device that is hosting a web service that knows how to accept incoming internet connections and speak the HTTP application protocol.

### History

In the early days of web programming, you would buy a massive, complex, expensive, software program that spoke HTTP and installed on a hardware server. The package of server and software was considered the web server because the web service software was the only thing running on the server.

When Berners-Lee wrote his first web server it only served up static HTML files. This soon advanced so that they allowed dynamic functionality, including the ability to generate all the HTML on demand in response to a users interaction. That facilitated what we now know as modern web applications.

### Combining web and application services

Today, most modern programming languages include libraries that provide the ability to make connections and serve up HTTP. For example, here is a simple Go language program that is a fully functioning web service.

```go
package main

import (
	"net/http"
)

func main() {
	// Serve up files found in the public_html directory
	fs := http.FileServer(http.Dir("./public_html"))
	http.Handle("/", fs)

	// Listen for HTTP requests
	http.ListenAndServe(":3000", nil)
}
```

Being able to easily create web services makes it easy to completely drop the monolithic web server concept and just build web services right into your web application. With our simple `go` example we can add a function that responds with the current time, when the `/api/time` resource is requested.

```go
package main

import (
	"fmt"
	"io"
	"net/http"
	"time"
)

func getTime(w http.ResponseWriter, r *http.Request) {
	io.WriteString(w, time.Now().String())
}

func main() {
	// Serve up files found in the public_html directory
	fs := http.FileServer(http.Dir("./public_html"))
	http.Handle("/", fs)

	// Dynamically provide data
	http.HandleFunc("/api/time", getTime)

	// Listen for HTTP requests
	fmt.Println(http.ListenAndServe(":3000", nil))
}
```

We can run that web service code, and use the console application `Curl` to make an HTTP request and see the time response.

```bash
➜  curl localhost:3000/api/time

2022-12-03 09:50:37.391983 -0700
```

### Web Service Gateways

Since it is so easy to build web services it is common to find multiple web services running on the same computing device. The trick is exposing the multiple services in a way that a connection can be made to each of them. Every network device allows for separate network connections by referring to a unique **port** number. Each service on the device starts up on a different port. In the example above, the `go` web service was using port 80. So you could just have a user access each service by referring to the port it was launched on. 

However, this makes it difficult for the user of the services to remember what port matches to which service. To resolve this we introduce a **service gateway**, or sometimes called a **reverse proxy**, that is itself a simple web service that listens on the common HTTPS **port 443**. The gateway then looks at the request and maps it to the other services running on a different ports.

![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/dd9295af-0b67-4b6a-ae14-8f9db23fb67b/ed0ad122-98e0-4a94-a2d9-319eb3b8083a/Untitled.png)

**Caddy** is an application commonly used as a gateway to web services

### Microservices

Web services that provide a single functional purpose are referred to as **microservices**. By partitioning functionality into small logical chunks, you can develop and manage them independently from other functionality in a larger system. They can also handle large fluctuations in user demand by simply running more and more stateless copies of the microservice from multiple virtual servers hosted in a dynamic cloud environment. For example, one microservice for generating your genealogical family tree might be able to handle 1,000 users concurrently. So in order to support 1 million users, you just deploy 1,000 instances of the service running on scalable virtual hardware.

### Serverless

The idea of microservices naturally evolved into the world of **serverless** functionality where the server is conceptually removed from the architecture and you just write a function that speaks HTTP. That function is loaded through an gateway that maps a web request to the function. The gateway automatically scales the hardware needed to host the serverless function based on demand. This reduces what the web application developer needs to think about down to a single independent function.

### Domain Names

📖 **Deeper dive reading**: [MDN What is a Domain Name](https://developer.mozilla.org/en-US/docs/Learn/Common_questions/What_is_a_domain_name)

In the instruction about the internet we showed how an IP address can be referenced by a domain name. You can get the IP address for any domain using the `dig` console utility. 

Notice that in the following example there are actually multiple IP addresses associated with the domain name `amazon.com`. This allows for redundancy in case one of the IP addresses fails to successfully resolve to a valid connection because the server listening at that IP address is not responding.

```bash
➜  dig amazon.com

amazon.com.		126	IN	A	205.251.242.103
amazon.com.		126	IN	A	52.94.236.248
amazon.com.		126	IN	A	54.239.28.85
```

A **domain name** is simply a text string that follows a specific naming convention and is listed in a special database called the domain name registry.

Domain names are broken up into a **root domain**, with one or more possible **subdomain** prefixes. The root domain is represented by a secondary level domain and a top level domain. The **top level domain (TLD)** represent things like `com`, `edu`, or `click`. So a root domain would look something like `byu.edu`, `google.com`, or `cs260.click`. The [possible list of TLDs](https://www.icann.org/resources/pages/tlds-2012-02-25-en) is controlled by ICANN, one of the governing boards of the internet.

![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/dd9295af-0b67-4b6a-ae14-8f9db23fb67b/7e916588-7dcd-40dd-951f-435eac96a593/Untitled.png)

The owner of a root domain can create any number of subdomains off the root domain. Each subdomain may resolve to a different IP address.

You can get information about a domain name from the domain name registry using the `whois` console utility.

```
➜  whois byu.edu
```

This provides information such as a technical contact to talk to if there is a problem with the domain, and an administrative contact to talk to if you want to buy the domain. 

### DNS

Once a domain name is in the registry it can be listed with a **domain name system (DNS)** server and associated with an IP address. Of course you must also lease the IP address before you can use it to uniquely identify a device on the internet. Every DNS server in the world references a few special DNS servers that are considered the **authoritative name servers** for associating a domain name with an IP address.

The DNS database records that facilitate the mapping of domain names to IP addresses come in several flavors. The main ones we are concerned with are the **address** (`**A**`) and the **canonical name** (`**CNAME**`) records. An `A` record is a straight mapping from a domain name to IP address. A `CNAME` record maps one domain name to another domain name. This acts as a domain name alias. You would use a `CNAME` to do things like map `byu.com` to the same IP address as `byu.edu` so that either one could be used.

When you enter a domain name into a browser, the browser first checks to see if it has the name already in its cache of names. If it does not, it contacts a DNS server and gets the IP address. The DNS server also keeps a cache of names. If the domain name is not in the cache, it will request the name from an authoritative name server. If the authority does not know the name then you get an unknown domain name error. If the process does resolve, then the browser makes the HTTP connection to the associated IP address.

As you can see, there is a lot of levels of name caching. This is done for performance reasons, but it also can be frustrating when you are trying to update the information associated with your domain name. This is where the **time to live** (**TTL**) setting for a domain record comes into play. You can set this to be something short like 5 minutes or as long as several days. The different caching layers should then honor the TTL and clear their cache after the requested period has passed.

### Leasing a domain name

You can pay to lease an unused domain name for a specific period of time. Before the lease expires, you have the right to extend the lease for an additional amount of time. The cost to buy the domain varies from something like $3 to $200 a year. Buying, or sub-leasing, an existing domain name from a private party can be very expensive, and so you are better off buying something obscure. This is one reason why companies have such strange names these days.

Refer to the instruction on using [Route 53](https://learn.cs260.click/page/webServers/amazonWebServicesRoute53/amazonWebServicesRoute53_md) if you are interested in leasing a domain name.

### Web services

A web application is loaded from a web server and runs on the user's browser. All of the files that are running on the browser, such as HTML, CSS, JavaScript, or image files, comprise the **frontend** of an application.

Notice that when the frontend requests the application files from the web server it is using the HTTPS protocol. All web programming requests between devices use HTTPS to exchange data.

![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/dd9295af-0b67-4b6a-ae14-8f9db23fb67b/545f1986-8c98-43cc-88ff-40dff6a47a51/Untitled.png)

From the frontend JavaScript we can make requests to external services running anywhere in the world. To make a web service request, we supply the URL of the web service to the `**fetch**` function that is built into the browser.

![This allows us to get external data, such as an inspirational quote, that we then inject into the DOM for the user to read.](https://prod-files-secure.s3.us-west-2.amazonaws.com/dd9295af-0b67-4b6a-ae14-8f9db23fb67b/eee65f74-cf26-43a3-897e-9b954205a095/Untitled.png)

This allows us to get external data, such as an inspirational quote, that we then inject into the DOM for the user to read.

The next step in building a full stack web application is to create a web service. A web service will provide the static frontend files along with functions to handle `fetch` requests for things like storing data persistently, providing security, running tasks, executing application logic that you don't want your user to be able to see, and communicating with other users. The functionality provided by your web service represents the **backend** of your application.

![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/dd9295af-0b67-4b6a-ae14-8f9db23fb67b/4cfb48c7-63f4-46e5-bb25-6b38bdc9f54c/Untitled.png)

The backend web service can also use `fetch` to make requests to other web services.

![Here, the frontend uses `fetch` to request the user's data from the backend web service. The backend then uses `fetch` to call two other web services, one to get the user's data from the database, and another one to request subway routes that are near the user's home. That data is then combined together by the backend web service and returned to the frontend for display in the browser.](https://prod-files-secure.s3.us-west-2.amazonaws.com/dd9295af-0b67-4b6a-ae14-8f9db23fb67b/608018e5-2d94-4504-885a-c9de80c14075/Untitled.png)

Here, the frontend uses `fetch` to request the user's data from the backend web service. The backend then uses `fetch` to call two other web services, one to get the user's data from the database, and another one to request subway routes that are near the user's home. That data is then combined together by the backend web service and returned to the frontend for display in the browser.

### Ports

When you connect to a device on the internet you need both an IP address and a numbered port. Port numbers allow a single device to support multiple protocols (e.g. HTTP, HTTPS, FTP, or SSH) as well as different types of services (e.g. search, document, or authentication). The ports may be exposed externally, or they may only be used internally on the device. For example, the HTTPS port (`443`) might allow the world to connect, the SSH port (`22`) might only allow computers at your school, and a service defined port (say `3000`) may only allow access to processes running on the device.

The internet governing body, IANA, defines the standard usage for port numbers. Ports from 0 to 1023 represent standard protocols. Generally a web service should avoid these ports unless it is providing the protocol represented by the standard. Ports from 1024 to 49151 represent ports that have been assigned to requesting entities. However, it is very common for these ports to be used by services running internally on a device. Ports from 49152 to 65535 are considered dynamic and are used to create dynamic connections to a device. [Here](https://www.iana.org/assignments/service-names-port-numbers/service-names-port-numbers.xhtml) is the link to IANA's registry.

Here is a list of common port numbers that you might come across.

| Port | Protocol |
| --- | --- |
| 20 | File Transfer Protocol (FTP) for data transfer |
| 22 | Secure Shell (SSH) for connecting to remote devices |
| 25 | Simple Mail Transfer Protocol (SMTP) for sending email |
| 53 | Domain Name System (DNS) for looking up IP addresses |
| 80 | Hypertext Transfer Protocol (HTTP) for web requests |
| 110 | Post Office Protocol (POP3) for retrieving email |
| 123 | Network Time Protocol (NTP) for managing time |
| 161 | Simple Network Management Protocol (SNMP) for managing network devices such as routers or printers |
| 194 | Internet Relay Chat (IRC) for chatting |
| 443 | HTTP Secure (HTTPS) for secure web requests |

### Example

As an example of how ports are used we can look at your web server. When you built your web server you externally exposed port 22 so that you could use SSH to open a remote console on the server, port 443 for secure HTTP communication, and port 80 for unsecure HTTP communication.

![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/dd9295af-0b67-4b6a-ae14-8f9db23fb67b/6eca0196-a519-4948-8fc3-57cf0f5a8d06/Untitled.png)

Your web service, Caddy, is listening on ports 80 and 443. When Caddy gets a request on port 80, it automatically redirects the request to port 443 so that a secure connection is used. When Caddy gets a request on port 443 it examines the path provided in the HTTP request (as defined by the URL) and if the path matches a static file, it reads the file off disk and returns it. If the HTTP path matches one of the definitions it has for a gateway service, Caddy makes a connection on that service's port (e.g. 3000 or 4000) and passes the request to the service.

Internally on your web server, you can have as many web services running as you would like. However, you must make sure that each one uses a different port to communicate on. You run your Simon service on port 3000 and therefore **cannot** use port 3000 for your startup service. Instead you use port 4000 for your startup service. It does not matter what high range port you use. It only matters that you are consistent and that they are only used by one service.

### HTTP

📖 **Deeper dive reading**: [MDN An overview of HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview)

**Hypertext Transfer Protocol** (**HTTP**) is how the web talks. When a web browser makes a request to a web server it does it using the HTTP protocol. 

When a web client (e.g. a web browser) and a web server talk they exchange HTTP requests and responses. The browser will make an HTTP request and the server will generate an HTTP response. You can see the HTTP exchange by using the browser's debugger or by using a console tool like `**curl**`.

```bash
curl -v -s http://info.cern.ch/hypertext/WWW/Helping.html
```

### Request

The HTTP request for the above command would look like the following.

```
GET /hypertext/WWW/Helping.html HTTP/1.1
Host: info.cern.ch
Accept: text/html
```

An HTTP request has this general syntax:

```html
<verb> <url path, parameters, anchor> <version>
[<header key: value>]*
[

  <body>
]
```

The first line of the HTTP request contains the `verb` of the request, followed by the path, parameters, and anchor of the URL, and finally the version of HTTP being used. The following lines are optional headers that are defined by key value pairs. After the headers you have an optional body. The body start is delimited from the headers with two new lines.

In the above example, we are asking to `GET` a resource found at the path `/hypertext/WWW/Helping.html`. The version used by the request is `HTTP/1.1`. This is followed by two headers. The first specifies the requested host (i.e. domain name). The second specifies what type of resources the client will accept. The resource type is always a [MIME type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types) as defined by internet governing body IANA. In this case we are asking for HTML.

### Response

The response to the above request looks like this.

```
HTTP/1.1 200 OK
Date: Tue, 06 Dec 2022 21:54:42 GMT
Server: Apache
Last-Modified: Thu, 29 Oct 1992 11:15:20 GMT
ETag: "5f0-28f29422b8200"
Accept-Ranges: bytes
Content-Length: 1520
Connection: close
Content-Type: text/html

<TITLE>Helping -- /WWW</TITLE>
<NEXTID 7>
<H1>How can I help?</H1>There are lots of ways you can help if you are interested in seeing
the <A NAME=4 HREF=TheProject.html>web</A> grow and be even more useful...
```

An HTTP response has the following syntax.

```html
<version> <status code> <status string>
[<header key: value>]*
[

  <body>
]
```

You can see that the response syntax is similar to the request syntax. The major difference is that the first line represents the version and the status of the response.

### Verbs

There are several verbs that describe what the HTTP request is asking for. The list below only describes the most common ones.

| Verb | Meaning |
| --- | --- |
| GET | Get the requested resource. This can represent a request to get a single resource or a resource representing a list of resources. |
| POST | Create a new resource. The body of the request contains the resource. The response should include a unique ID of the newly created resource. |
| PUT | Update a resource. Either the URL path, HTTP header, or body must contain the unique ID of the resource being updated. The body of the request should contain the updated resource. The body of the response may contain the resulting updated resource. |
| DELETE | Delete a resource. Either the URL path or HTTP header must contain the unique ID of the resource to delete. |
| OPTIONS | Get metadata about a resource. Usually only HTTP headers are returned. The resource itself is not returned. |

### Status codes

It is important that you use the standard HTTP status codes in your HTTP responses so that the client of a request can know how to interpret the response. The codes are partitioned into five blocks.

- 1xx - Informational.
- 2xx - Success.
- 3xx - Redirect to some other location, or that the previously cached resource is still valid.
- 4xx - Client errors. The request is invalid.
- 5xx - Server errors. The request cannot be satisfied due to an error on the server.

Within those ranges here are some of the more common codes. See the [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) for a full description of status codes.

| Code | Text | Meaning |
| --- | --- | --- |
| 100 | Continue | The service is working on the request |
| 200 | Success | The requested resource was found and returned as appropriate. |
| 201 | Created | The request was successful and a new resource was created. |
| 204 | No Content | The request was successful but no resource is returned. |
| 304 | Not Modified | The cached version of the resource is still valid. |
| 307 | Permanent redirect | The resource is no longer at the requested location. The new location is specified in the response location header. |
| 308 | Temporary redirect | The resource is temporarily located at a different location. The temporary location is specified in the response location header. |
| 400 | Bad request | The request was malformed or invalid. |
| 401 | Unauthorized | The request did not provide a valid authentication token. |
| 403 | Forbidden | The provided authentication token is not authorized for the resource. |
| 404 | Not found | An unknown resource was requested. |
| 408 | Request timeout | The request takes too long. |
| 409 | Conflict | The provided resource represents an out of date version of the resource. |
| 418 | https://en.wikipedia.org/wiki/Hyper_Text_Coffee_Pot_Control_Protocol | The service refuses to brew coffee in a teapot. |
| 429 | Too many requests | The client is making too many requests in too short of a time period. |
| 500 | Internal server error | The server failed to properly process the request. |
| 503 | Service unavailable | The server is temporarily down. The client should try again with an exponential back off. |

### Headers

📖 **Deeper dive reading**: [MDN HTTP headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers)

HTTP headers specify metadata about a request or response. This includes things like how to handle security, caching, data formats, and cookies. Some common headers that you will use include the following.

| Header | Example | Meaning |
| --- | --- | --- |
| Authorization | Bearer bGciOiJIUzI1NiIsI | A token that authorized the user making the request. |
| Accept | image/* | The format the client accepts. This may include wildcards. |
| Content-Type | text/html; charset=utf-8 | The format of the content being sent. These are described using standard https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types types. |
| Cookie | SessionID=39s8cgj34; csrftoken=9dck2 | Key value pairs that are generated by the server and stored on the client. |
| Host | info.cern.ch | The domain name of the server. This is required in all requests. |
| Origin | cs260.click | Identifies the origin that caused the request. A host may only allow requests from specific origins. |
| Access-Control-Allow-Origin | https://cs260.click | Server response of what origins can make a request. This may include a wildcard. |
| Content-Length | 368 | The number of bytes contained in the response. |
| Cache-Control | public, max-age=604800 | Tells the client how it can cache the response. |
| User-Agent | Mozilla/5.0 (Macintosh) | The client application making the request. |

### Body

The format of the body of an HTTP request or response is defined by the `Content-Type` header. For example, it may be HTML text (`text/html`), a binary image format (`image/png`), JSON (`application/json`), or JavaScript (`text/javascript`). A client may specify what formats it accepts using the `accept` header.

### Cookies

![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/dd9295af-0b67-4b6a-ae14-8f9db23fb67b/e005d448-d4c6-4c24-9885-f068ce96866c/Untitled.png)

📖 **Deeper dive reading**: [MDN Using HTTP cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)

HTTP itself is stateless. This means that one HTTP request does not know anything about a previous or future request. However, that does not mean that a server or client cannot track state across requests. One common method for tracking state is the `cookie`. Cookies are generated by a server and passed to the client as a **`Set-Cookie`** HTTP header.

```
HTTP/2 200
Set-Cookie: myAppCookie=tasty; SameSite=Strict; Secure; HttpOnly
```

The client then caches the cookie and returns it as a `**Cookie**` HTTP header back to the server on subsequent requests.

```
HTTP/2 200
Cookie: myAppCookie=tasty
```

This allows the server to remember things like the language preference of the user, or the user's authentication credentials. A server can also use cookies to track, and share, everything that a user does. However, there is nothing inherently evil about cookies; the problem comes from web applications that use them as a means to violate a user's privacy or inappropriately monetize their data.

### HTTP Versions

HTTP continually evolves in order to increase performance and support new types of applications. You can read about the evolution of HTTP on [MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Evolution_of_HTTP).

| Year | Version | Features |
| --- | --- | --- |
| 1990 | HTTP0.9 | one line, no versions, only get |
| 1996 | HTTP1 | get/post, header, status codes, content-type |
| 1997 | HTTP1.1 | put/patch/delete/options, persistent connection |
| 2015 | HTTP2 | multiplex, server push, binary representation |
| 2022 | HTTP3 | QUIC for transport protocol, always encrypted |

### Fetch

🔑 **Recommended reading**: [MDN Using the Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)

The ability to make HTTP requests from JavaScript is one of the main technologies that changed the web from static content pages (Web 1.0) to one of web applications (Web 2.0) that fully interact with the user. Microsoft introduced the first API for making HTTP requests from JavaScript with the [XMLHttpRequest API](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest).

Today, the [fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) is the preferred way to make HTTP requests. The `fetch` function is built into the browser's JavaScript runtime. This means you can call it from JavaScript code running in a browser.

The basic usage of fetch takes a URL and returns a promise. The promise `then` function takes a callback function that is asynchronously called when the requested URL content is obtained. If the returned content is of type `application/json` you can use the `json` function on the response object to convert it to a JavaScript object.

The following example makes a fetch request to get and display an inspirational quote.

```jsx
fetch('https://api.quotable.io/random')
  .then((response) => response.json())
  .then((jsonResponse) => {
    console.log(jsonResponse);
  });
```

**Response**

```jsx
{
  content: 'Never put off till tomorrow what you can do today.',
  author: 'Thomas Jefferson',
};
```

To do a POST request you populate the options parameter with the HTTP method and headers.

```jsx
fetch('https://jsonplaceholder.typicode.com/posts', {
  method: 'POST',
  body: JSON.stringify({
    title: 'test title',
    body: 'test body',
    userId: 1,
  }),
  headers: {
    'Content-type': 'application/json; charset=UTF-8',
  },
})
  .then((response) => response.json())
  .then((jsonResponse) => {
    console.log(jsonResponse);
  });
```

## Node.js

### Creating a simple web server using Node

In 2009 Ryan Dahl created `Node.js`. It was the first successful application for deploying JavaScript outside of a browser. This changed the JavaScript mindset from a browser technology to one that could run on the server as well. This means that JavaScript can power your entire technology stack. One language to rule them all. Node.js is often just referred to as Node, and is currently maintained by the [Open.js Foundation](https://openjsf.org/).

Browsers run JavaScript using a JavaScript interpreter and execution engine. For example, Chromium based browsers all use the [V8](https://v8.dev/) engine created by Google. Node.js simply took the V8 engine and ran it inside of a console application. When you run a JavaScript program in Chrome or Node.js, it is V8 that reads your code and executes it. With either program wrapping V8, the result is the same.

![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/dd9295af-0b67-4b6a-ae14-8f9db23fb67b/5ef156e7-4b01-4bd0-83ac-3874bcfa86e5/Untitled.png)

### Installing NVM and Node.js

The easiest way to install Node.js is to first install the `Node Version Manager` (NVM) and use it to install, and manage, Node.js.

**Installing on Windows**

If you are using Windows, then follow the installation instructions from the [windows-nvm](https://github.com/coreybutler/nvm-windows#installation--upgrades) repository. Click on `latest installer` and then scroll down to the `Assets` and download and execute nvm-setup.exe. Once the installation is complete, you will need to open a new console window so that it gets the updated path that includes NVM.

In the console application install the long term support (LTS) version of Node.

```bash
➜ nvm install lts
➜ nvm use lts
```

**Installing on Linux or MacOS**

If you are using Linux or MacOS then you can install NVM with the following console commands.

```bash
➜ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

➜ . ~/.nvm/nvm.sh # temporarily source file to make nvm command available
```

In the console application install the long term support (LTS) version of Node.

```bash
➜ nvm install --lts # 
```

**Checking that Node is installed**

The node.js console application is simply called `node`. You can verify that Node is working correctly by running `node` with the `-v` parameter. Note that your version might be different than what is shown here. As long as it is an LTS version you should be fine.

```bash
➜ node -v
v20.11.1
```

### Running programs

You can execute a line of JavaScript with Node.js from your console with the `-e` parameter.

```
➜  node -e "console.log(1+1)"
2
```

However, to do real work you need to execute an entire project composed of dozens or even hundreds of JavaScript files. You do this by creating a single starting JavaScript file, named something like `index.js`, that references the code found in the rest of your project. You then execute your code by running `node` with `index.js` as a parameter. For example, with the following JavaScript saved to a file named `index.js`

```
function countdown() {
  let i = 0;
  while (i++ < 5) {
    console.log(`Counting ... ${i}`);
  }
}

countdown();

```

We can execute the JavaScript by passing the file to `node`, and receive the following result.

```
➜  node index.js
Counting ... 1
Counting ... 2
Counting ... 3
Counting ... 4
Counting ... 5

```

You can also run `node` in interpretive mode by executing it without any parameters and then typing your JavaScript code directly into the interpreter.

```
➜ node
Welcome to Node.js v16.15.1.
> 1+1
2
> console.log('hello')
hello
```

### Node package manager

While you could write all of the JavaScript for everything you need, it is always helpful to use preexisting packages of JavaScript for implementing common tasks. To load a package using Node.js you must take two steps. First install the package locally on your machine using the Node Package Manager (NPM), and then include a `require` statement in your code that references the package name. NPM is automatically installed when you install Node.js.

NPM knows how to access a massive repository of preexisting packages. You can search for packages on the [NPM website](https://www.npmjs.com/). However, before you start using NPM to install packages you need to initialize your code to use NPM. This is done by creating a directory that will contain your JavaScript and then running `npm init`. NPM will step you through a series of questions about the project you are creating. You can press the return key for each of questions if you want to accept the defaults. If you are always going to accept all of the defaults you can use `npm init -y` and skip the Q&A.

```
➜  mkdir npmtest
➜  cd npmtest
➜  npm init -y
```

If you list the files in the directory you will notice that it has created a file named `package.json`. This file contains three main things: 

1) Metadata about your project such as its name and the default entry JavaScript file

2) commands (scripts) that you can execute to do things like run, test, or distribute your code

3) packages that this project depends upon

The following shows what your `package.json` looks like currently. It has some default metadata and a simple placeholder script that just runs the echo command when you execute `npm run test`from the console.

```json
{
  "name": "npmtest",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "keywords": [],
  "author": "",
  "license": "ISC",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  }
}
```

With NPM initialized to work with your project, you can now use it to install a node package. As a simple example, we will install a package that knows how to tell jokes. This package is called `give-me-a-joke`. You can search for it on the [NPM website](https://www.npmjs.com/), see how often it is installed, examine the source code, and learn about who created it. You install the package using `npm install` followed by the name of the package.

```
➜  npm install give-me-a-joke
```

If you again examine the contents of the `package.json` file you will see a reference to the newly installed package dependency. 

If you decide you no longer want a package dependency you can always remove it with the `npm uninstall <package name here>` console command.

With the dependency added, the unnecessary metadata removed, the addition of a useful script to run the program, and also adding a description, the `package.json` file should look like this:

```json
{
  "name": "npmtest",
  "version": "1.0.0",
  "description": "Simple Node.js demo",
  "main": "index.js",
  "license": "MIT",
  "scripts": {
    "dev": "node index.js"
  },
  "dependencies": {
    "give-me-a-joke": "^0.5.1"
  }
}
```

<aside>
⚠️ Note that when you start installing package dependencies, NPM will create an additional file named `package-lock.json` and a directory named `node_modules` in your project directory. The `node_modules` directory contains the actual JavaScript files for the package and all of its dependent packages. As you install several packages this directory will start to get very large. You do **not** want to check this directory into your source control system since it can be very large and can be rebuilt using the information contained in the `package.json` and `package-lock.json` files. So make sure you include `node_modules` in your `.gitignore` file.

</aside>

When you clone your source code from GitHub to a new location, the first thing you should do is run `npm install`in the project directory. This will cause NPM to download all of the previously installed packages and recreate the `node_modules` directory.

The `package-lock.json` file tracks the version of the package that you installed. That way if you rebuild your `node_modules` directory you will have the version of the package you initially installed and not the latest available version, which might not be compatible with your code.

With NPM and the joke package installed, you can now use the joke package in a JavaScript file by referencing the package name as a parameter to the `require` function. This is then followed by a call to the joke object's `getRandomDadJoke` function to actually generate a joke. Create a file named `index.js` and paste the following into it.

**index.js**

```jsx
const giveMeAJoke = require('give-me-a-joke');
giveMeAJoke.getRandomDadJoke((joke) => {
  console.log(joke);
});
```

If you run this code using `node.js` you should get a result similar to the following.

```jsx
➜  node index.js
What do you call a fish with no eyes? A fsh.
```

This may seem like a lot of work but after you do it a few times it will begin to feel natural. Just remember the main steps.

1. Create your project directory
2. Initialize it for use with NPM by running `npm init -y`
3. Make sure `.gitignore` file contains `node_modules`
4. Install any desired packages with `npm install <package name here>`
5. Add `require('<package name here>')` to your application's JavaScript
6. Use the code the package provides in your JavaScript
7. Run your code with `node index.js`

### Creating a web service

With JavaScript we can write code that listens on a network port (e.g. 80, 443, 3000, or 8080), receives HTTP requests, processes them, and then responds. We can use this to create a simple web service that we then execute using Node.js.

First create your project.

```
➜ mkdir webservicetest
➜ cd webservicetest
➜ npm init -y
```

Now, open VS Code and create a file named `index.js`. Paste the following code into the file and save.

```jsx
const http = require('http');
const server = http.createServer(function (req, res) {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write(`<h1>Hello Node.js! [${req.method}] ${req.url}</h1>`);
  res.end();
});

server.listen(8080, () => {
  console.log(`Web service listening on port 8080`);
});
```

This code uses the Node.js built-in `http` package to create our HTTP server using the `http.createServer`function along with a callback function that takes a request (`req`) and response (`res`) object. That function is called whenever the server receives an HTTP request. In our example, the callback always returns the same HTML snippet, with a status code of 200, and a Content-Type header, no matter what request is made. Basically this is just a simple dynamically generated HTML page. A real web service would examine the HTTP path and return meaningful content based upon the purpose of the endpoint.

The `server.listen` call starts listening on port 8080 and blocks until the program is terminated.

We execute the program by going back to our console window and running Node.js to execute our index.js file. If the service starts up correctly then it should look like the following.

```
➜ node index.js
Web service listening on port 8080
```

You can now open your browser and point it to `localhost:8080` and view the result. The interaction between the JavaScript, node, and the browser looks like this:

![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/dd9295af-0b67-4b6a-ae14-8f9db23fb67b/7726d170-d70f-40f8-9762-96378ea5ef37/Untitled.png)

Use different URL paths in the browser and note that it will echo the HTTP method and path back in the document. You can kill the process by pressing `CTRL-C` in the console.

Note that you can also start up Node and execute the `index.js` code directly in VS Code. To do this open index.js in VS Code and press the 'F5' key. This should ask you what program you want to run. Select `node.js`. This starts up Node.js with the `index.js` file, but also attaches a debugger so that you can set breakpoints in the code and step through each line of code.

---

You should be aware that Ryan has created a successor to Node.js called `[Deno](https://deno.land/)`. This version is more compliant with advances in ECMAScript and has significant performance enhancements. There are also competitor server JavaScript applications. One of the more interesting rising stars is called `[Bun](https://bun.sh/)`. If you have the time you should learn about them.

### Express

📖 **Deeper dive reading**: [MDN Express/Node introduction](https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/Introduction)

In the previous instruction you saw how to use Node.js to create a simple web server. This works great for little projects where you are trying to quickly serve up some web content, but to build a production-ready application you need a framework with a bit more functionality for easily implementing a full web service. This is where the Node package `**Express**` come in. Express provides support for:

1. Routing requests for service endpoints
2. Manipulating HTTP requests with JSON body content
3. Generating HTTP responses
4. Using `middleware` to add functionality

Express was created by TJ Holowaychuk and is currently maintained by the [Open.js Foundation](https://openjsf.org/).

Everything in Express revolves around creating and using HTTP routing and middleware functions. You create an Express application by using NPM to install the Express package and then calling the `express` constructor to create the Express application and listen for HTTP requests on a desired port.

```bash
➜ npm install express
```

```jsx
// syntax to import modules in Node.js
const express = require('express'); 
const app = express();

app.listen(8080);
```

With the `app` object you can now add HTTP routing and middleware functions to the application.

### Defining routes

HTTP endpoints are implemented in Express by defining routes that call a function based upon an HTTP path. The Express `app` object supports all of the HTTP verbs as functions on the object. For example, if you want to have a route function that handles an HTTP GET request for the URL path `/store/provo` you would call the `get`method on the app.

```jsx
app.get('/store/provo', (req, res, next) => {
  res.send({name: 'provo'});
});
```

The `get` function takes two parameters, a URL path matching pattern, and a callback function that is invoked when the pattern matches. The path matching parameter is used to match against the URL path of an incoming HTTP request.

The callback function has three parameters that represent the HTTP request object (`req`), the HTTP response object (`res`), and the `next` routing function that Express expects to be called if this routing function wants another function to generate a response.

The Express `app` compares the routing function patterns in the order that they are added to the Express `app` object. So if you have two routing functions with patterns that both match, the first one that was added will be called and given the next matching function in the `next` parameter.

In our example above we hard coded the store name to be `provo`. A real store endpoint would allow any store name to be provided as a parameter in the path. Express supports path parameters by prefixing the parameter name with a colon (`:`). Express creates a map of path parameters and populates it with the matching values found in the URL path. You then reference the parameters using the `req.params`object. Using this pattern you can rewrite our getStore endpoint as follows.

```jsx
app.get('/store/:storeName', (req, res, next) => {
  res.send({name: req.params.storeName});
});
```

If we run our JavaScript using `node` we can see the result when we make an HTTP request using `curl`.

```bash
➜ curl localhost:8080/store/orem
{"name":"orem"}
```

If you wanted an endpoint that used the POST or DELETE HTTP verb then you just use the `post` or `delete` function on the Express `app` object.

The route path can also include a limited wildcard syntax or even full regular expressions in path pattern. Here are a couple route functions using different pattern syntax.

```jsx
// Wildcard - matches /store/x and /star/y
app.put('/st*/:storeName', (req, res) => res.send({update: req.params.storeName}));

// Pure regular expression
app.delete(/\/store\/(.+)/, (req, res) => res.send({delete: req.params[0]}));
```

Notice that in these examples the `next` parameter was omitted. Since we are not calling `next` we do not need to include it as a parameter. However, if you do not call `next` then no following middleware functions will be invoked for the request.

### Using middleware

📖 **Deeper dive reading**: [Express Middleware](https://expressjs.com/en/resources/middleware.html)

The standard [Mediator/Middleware](https://www.patterns.dev/posts/mediator-pattern/) design pattern has two pieces: a mediator and middleware. Middleware represents componentized pieces of functionality. The mediator loads the middleware components and determines their order of execution. When a request comes to the mediator it then passes the request around to the middleware components. Following this pattern, Express is the mediator, and middleware functions are the middleware components.

Express comes with a standard set of middleware functions. These provide functionality like routing, authentication, CORS, sessions, serving static web files, cookies, and logging. Some middleware functions are provided by default, and other ones must be installed using NPM before you can use them. You can also write your own middleware functions and use them with Express.

A middleware function looks very similar to a routing function. That is because routing functions are also middleware functions. The only difference is that routing functions are only called if the associated pattern matches. Middleware functions are always called for every HTTP request unless a preceding middleware function does not call `next`. A middleware function has the following pattern:

```jsx
function middlewareName(req, res, next)
```

The middleware function parameters represent the HTTP request object (`req`), the HTTP response object (`res`), and the `next` middleware function to pass processing to. You should usually call the `next` function after completing processing so that the next middleware function can execute.

![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/dd9295af-0b67-4b6a-ae14-8f9db23fb67b/6c10d444-52fb-4d49-b068-9031a4ef5ab6/Untitled.png)

### Creating your own middleware

As an example of writing your own middleware, you can create a function that logs out the URL of the request and then passes on processing to the next middleware function.

```jsx
app.use((req, res, next) => {
  console.log(req.originalUrl);
  next();
});
```

Remember that the order that you add your middleware to the Express app object controls the order that the middleware functions are called. Any middleware that does not call the `next` function after doing its processing, stops the middleware chain from continuing.

### Builtin middleware

In addition to creating your own middleware functions, you can use a built-in middleware function. Here is an example of using the `static` middleware function. This middleware responds with static files, found in a given directory, that match the request URL.

```jsx
app.use(express.static('public'));
```

Now if you create a subdirectory in your project directory and name it `public` you can serve up any static content that you would like. For example, you could create an `index.html` file that is the default content for your web service. Then when you call your web service without any path the `index.html` file will be returned.

### Third party middleware

You can also use third party middleware functions by using NPM to install the package and including the package in your JavaScript with the `require` function. The following uses the `cookie-parser` package to simplify the generation and access of cookies.

```bash
➜ npm install cookie-parser
```

```jsx
const cookieParser = require('cookie-parser');

app.use(cookieParser());

app.post('/cookie/:name/:value', (req, res, next) => {
  res.cookie(req.params.name, req.params.value);
  res.send({cookie: `${req.params.name}:${req.params.value}`});
});

app.get('/cookie', (req, res, next) => {
  res.send({cookie: req.cookies});
});
```

It is common for middleware functions to add fields and functions to the `req` and `res` objects so that other middleware can access the functionality they provide. You see this happening when the `cookie-parser` middleware adds the `req.cookies` object for reading cookies, and also adds the `res.cookie` function in order to make it easy to add a cookie to a response.

### Error handling middleware

You can also add middleware for handling errors that occur. Error middleware looks similar to other middleware functions, but it takes an additional `err` parameter that contains the error. 

```jsx
function errorMiddlewareName(err, req, res, next)
```

If you wanted to add a simple error handler for anything that might go wrong while processing HTTP requests you could add the following.

```jsx
app.use(function (err, req, res, next) {
  res.status(500).send({type: err.name, message: err.message});
});
```

We can test that our error middleware is getting used by adding a new endpoint that generates an error.

```jsx
app.get('/error', (req, res, next) => {
  throw new Error('Trouble in river city');
});
```

Now if we use `curl` to call our error endpoint we can see that the response comes from the error middleware.

```bash
➜ curl localhost:8080/error
{"type":"Error","message":"Trouble in river city"}
```

### Complete example web service:

```jsx
const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();

// Third party middleware - Cookies
app.use(cookieParser());

app.post('/cookie/:name/:value', (req, res, next) => {
  res.cookie(req.params.name, req.params.value);
  res.send({cookie: `${req.params.name}:${req.params.value}`});
});

app.get('/cookie', (req, res, next) => {
  res.send({cookie: req.cookies});
});

// Creating your own middleware - logging
app.use((req, res, next) => {
  console.log(req.originalUrl);
  next();
});

// Built in middleware - Static file hosting
app.use(express.static('public'));

// Routing middleware
app.get('/store/:storeName', (req, res) => {
  res.send({name: req.params.storeName});
});

app.put('/st*/:storeName', (req, res) => res.send({update: req.params.storeName}));

app.delete(/\/store\/(.+)/, (req, res) => res.send({delete: req.params[0]}));

// Error middleware
app.get('/error', (req, res, next) => {
  throw new Error('Trouble in river city');
});

app.use(function (err, req, res, next) {
  res.status(500).send({type: err.name, message: err.message});
});

// Listening to a network port
const port = 8080;
app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
```

### Debugging Node.js

https://learn.cs260.click/page/webServices/debuggingNode/debuggingNode_md

### Nodemon

Once you start writing complex web applications you will find yourself making changes in the middle of debugging sessions and you would like to have `node` restart automatically and update the browser as the changes are saved. This seems like a simple thing, but over the course of hundreds of changes, every second you can save really starts to add up.

The [Nodemon package](https://www.npmjs.com/package/nodemon) is basically a wrapper around `node` that watches for files in the project directory to change. When it detects that you saved something it will automatically restart `node`.

If you would like to experiment with this then take the following steps. First install Nodemon globally so that you can use it to debug all of your projects.

```
npm install -g nodemon
```

Then, because VS Code does not know how to launch Nodemon automatically, you need create a VS Code launch configuration. In VS Code press `CTRL-SHIFT-P` (on Windows) or `⌘-SHIFT-P` (on Mac) and type the command `Debug: Add configuration`. This will then ask you what type of configuration you would like to create. Type `Node.js` and select the `Node.js: Nodemon setup` option. In the launch configuration file that it creates, change the program from `app.js` to `main.js` (or whatever the main JavaScript file is for your application) and save the configuration file.

Now when you press `F5` to start debugging it will run Nodemon instead of Node.js, and your changes will automatically update your application when you save.

## SOP and CORS

📖 **Deeper dive reading**:

- [MDN Same origin policy](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy)
- [MDN Cross origin resource sharing](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

Security should always be on your mind when you are working with the web. The ability to provide services to a global audience makes the information on the web very valuable, and therefore an attractive target for nefarious parties. When website architecture and browser clients were still in their infancy they allowed JavaScript to make requests from one domain while displaying a website from a different domain. These are called cross-origin requests.

Consider the following example. An attacker sends out an email with a link to a hacker website (`byu.iinstructure.com`) that is similar to the real course website. Notice the additional `i`. If the hacker website could request anything from the real website then it could make itself appear and act just like the real education website. All it would have to do is request images, html, and login endpoints from the course's website and display the results on the hacker website. This would give the hacker access to everything the user did.

To combat this problem the `Same Origin Policy` (SOP) was created. Simply stated SOP only allows JavaScript to make requests to a domain if it is the same domain that the user is currently viewing. A request from `byu.iinstructure.com`for service endpoints that are made to `byu.instructure.com` would fail because the domains do not match. This provides significant security, but it also introduces complications when building web applications. For example, if you want build a service that any web application can use it would also violate the SOP and fail. In order to address this, the concept of Cross Origin Resource Sharing (CORS) was invented.

CORS allows the client (e.g. browser) to specify the origin of a request and then let the server respond with what origins are allowed. The server may say that all origins are allowed, for example if they are a general purpose image provider, or only a specific origin is allowed, for example if they are a bank's authentication service. If the server doesn't specify what origin is allowed then the browser assumes that it must be the same origin.

Going back to our hacker example, the HTTP request from the hacker site (`byu.iinstructure.com`) to the course's authentication service (`byu.instructure.com`) would look like the following:

```agda
GET /api/auth/login HTTP/2
Host: byu.instructure.com
Origin: https://byu.iinstructure.com
```

In response the course website would return:

```agda
HTTP/2 200 OK
Access-Control-Allow-Origin: https://byu.instructure.com
```

The browser would then see that the actual origin of the request does not match the allowed origin and so the browser blocks the response and generates an error.

Notice that with CORS, it is the browser that is protecting the user from accessing the course website's authentication endpoint from the wrong origin. CORS is only meant to alert the user that something nefarious is being attempted. A hacker can still proxy requests through their own server to the course website and completely ignore the `Access-Control-Allow-Origin` header. Therefore the course website needs to implement its own precautions to stop a hacker from using its services inappropriately.

### Using third party services

When you make requests to your own web services you are always on the same origin and so you will not violate the SOP. However, if you want to make requests to a different domain than the one your web application is hosted on, then you need to make sure that domain allows requests as defined by the `Access-Control-Allow-Origin` header it returns. For example, if I have JavaScript in my web application loaded from `cs260.click` that makes a fetch request for an image from the website `i.picsum.photos` the browser will fail the request with an HTTP status code of 403 and an error message that CORS has blocked the request.

!https://raw.githubusercontent.com/webprogramming260/.github/main/profile/webServices/cors/webServicesCors.jpg

That happens because `i.picsum.photos` does not return an `Access-Control-Allow-Origin`header. Without a header the browser assumes that all requests must be made from the same origin.

If your web application instead makes a service request to `icanhazdadjoke.com` to get a joke, that request will succeed because `icanhazdadjoke.com` returns an `Access-Control-Allow-Origin`header with a value of `*` meaning that any origin can make requests to this service.

```
HTTP/2 200
access-control-allow-origin: *

Did you hear about the bread factory burning down? They say the business is toast.

```

This would have also succeeded if the HTTP header had explicitly listed your web application domain. For example, if you make your request from the origin `cs260.click` the following response would also satisfy CORS.

```
HTTP/2 200
access-control-allow-origin: https://cs260.click

I’ll tell you something about German sausages, they’re the wurst

```

This all means that you need to test the services you want to use before you include them in your application. Make sure they are responding with `*` or your calling origin. If they do not then you will not be able to use them.

## Service Design

### Model and Sequence Diagrams

When first considering your service design it is helpful to model the application's primary objects and the interactions of the objects. You should attempt to stay as close to the model that is in your user's mind as possible. Avoid introducing a model that focuses on programming constructs and infrastructure. For example, a chat program should model participants, conversations, and messages. It should not model user devices, network connections, and data blobs.

Once you have defined your primary objects you can create sequence diagrams that show how the objects interact with each other. This will help clarify your model and define the necessary endpoints. You can use a simple tool like [SequenceDiagram.org](https://sequencediagram.org/index.html#initialData=C4S2BsFMAIGEAsCGxqIA5oFCcQY2APYBO0AguCLpDvsdAEIEBG25lkAtAHwDKkRAN34AuPikQDEIcIiZRMjJtz6CRY1JOmz5igDy6OHFUKLC2VDVJlzq5yPsPGRDZpa03Md5fxOjgiIhRcAgA7EwBnZBBQ6AB3MHgXFj0DIx8RWFCIqJiiSABHAFdIcJQQglAAM0ockIVmb1VTUlwqNBQ7aGCw-kjQUPqlXnTTHkQAT2gAIgAJSHBwAinoQjIKKkwnIm47YVn5xeXKogIAWySgA) to create and share diagrams.

![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/dd9295af-0b67-4b6a-ae14-8f9db23fb67b/c89ea78e-51f5-475b-a47e-fdcc87d3a1cb/Untitled.png)

### Leveraging HTTP

Web services are usually provided over HTTP, and so HTTP greatly influences the design of the service. The HTTP verbs such as GET, POST, PUT, and DELETE often mirror the designed actions of a web service. For example, a web service for managing comments might list the comments (GET), create a comment (POST), update a comment (PUT), and delete a comment (DELETE). Likewise, the MIME content types defined by IANA are a natural fit for defining the types of content that you want to provide (e.g. HTML, PNG, MP3, and MP4). The goal is to leverage those technologies as much as possible so that you don't have to recreate the functionality they provide and instead take advantage of the significant networking infrastructure built up around HTTP. This includes caching servers that increase your performance, edge servers that bring your content closer, and replication servers that provide redundant copies of your content and make your application more resilient to network failures.

![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/dd9295af-0b67-4b6a-ae14-8f9db23fb67b/74aea745-ed5b-445a-9ed1-afd99f852bee/Untitled.png)

### Endpoints

A web service is usually divided up into multiple service endpoints. Each endpoint provides a single functional purpose. All of the criteria that you would apply to creating well designed code functions also applies when exposing service endpoints.

![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/dd9295af-0b67-4b6a-ae14-8f9db23fb67b/1e1e7094-149a-4272-93f6-34ff33a6588e/Untitled.png)

<aside>
☝ Note that service endpoints are often called an Application Programming Interface (API). This is a throwback to old desktop applications and the programming interfaces that they exposed. Sometimes the term API refers to the entire collection of endpoints, and sometimes it is used to refer to a single endpoint.

</aside>

Here are some things you should consider when designing your service's endpoints.

- **Grammatical** - With HTTP everything is a resource (think noun or object). You act on the resource with an HTTP verb. For example, you might have an order resource that is contained in a store resource. You then create, get, update, and delete order resources on the store resource.
- **Readable** - The resource you are referencing with an HTTP request should be clearly readable in the URL path. For example, an order resource might contain the path to both the order and store where the order resource resides: `/store/provo/order/28502`. This makes it easier to remember how to use the endpoint because it is human readable.
- **Discoverable** - As you expose resources that contain other resources you can provide the endpoints for the aggregated resources. This makes it so someone using your endpoints only needs to remember the top level endpoint and then they can discover everything else. For example, if you have a store endpoint that returns information about a store you can include an endpoint for working with a store in the response.
    
    ```agda
    GET /store/provo  HTTP/2
    ```
    
    ```json
    {
      "id": "provo",
      "address": "Cougar blvd",
      "orders": "https://cs260.click/store/provo/orders",
      "employees": "https://cs260.click/store/provo/employees"
    }
    ```
    
- **Compatible** - When you build your endpoints you want to make it so that you can add new functionality without breaking existing clients. Usually this means that the clients of your service endpoints should ignore anything that they don't understand. Consider the two following JSON response versions.
    
    **Version 1**
    
    ```json
    {
      "name": "John Taylor"
    }
    ```
    
    **Version 2**
    
    ```json
    {
      "name": "John Taylor",
      "givenName": "John",
      "familyName": "Taylor"
    }
    ```
    
    By adding a new representation of the `name` field, you provide new functionality for clients that know how to use the new fields without harming older clients that ignore the new fields and simply use the old representation. This is all done without officially versioning the endpoint.
    
    If you are fortunate enough to be able to control all of your client code you can mark the `name` field as depreciated and in a future version remove it once all of the clients have upgraded. Usually you want to keep compatibility with at least one previous version of the endpoint so that there is enough time for all of the clients to migrate before compatibility is removed.
    
- **Simple** - Keeping your endpoints focused on the primary resources of your application helps to avoid the temptation to add endpoints that duplicate or create parallel access to primary resources. It is very helpful to write some simple class and sequence diagrams that outline your primary resources before you begin coding. These resources should focus on the actual resources of the system you are modeling. They should not focus on the data structure or devices used to host the resources. There should only be one way to act on a resource. Endpoints should only do one thing.
- **Documented** - The [Open API Specification](https://spec.openapis.org/oas/latest.html) is a good example of tooling that helps create, use, and maintain documentation of your service endpoints. It is highly suggested that you make use of such tools in order to provide client libraries for your endpoints and a sandbox for experimentation. Creating an initial draft of your endpoint documentation before you begin coding will help you mentally clarify your design and produce a better final result. Providing access to your endpoint documentation along with your production system helps with client implementations and facilitates easier maintenance of the service. The [Swagger Petstore](https://petstore.swagger.io/) example documentation is a reasonable example to follow.

There are many models for exposing endpoints. We will consider three common ones, RPC, REST, and GraphQL.

### RPC

Remote Procedure Calls (RPC) expose service endpoints as simple function calls. When RPC is used over HTTP it usually just leverages the POST HTTP verb. The actual verb and subject of the function call is represented by the function name. For example, `deleteOrder` or `updateOrder`. The name of the function is either the entire path of the URL or a parameter in the POST body.

```jsx
POST /updateOrder HTTP/2

{"id": 2197, "date": "20220505"}
```

or

```jsx
POST /rpc HTTP/2

{"cmd":"updateOrder", "params":{"id": 2197, "date": "20220505"}}
```

One advantage of RPC is that it maps directly to function calls that might exist within the server. This could also be considered a disadvantage as it directly exposes the inner workings of the service, and thus creates a coupling between the endpoints and the implementation.

### REST

Representational State Transfer (REST) attempts to take advantage of the foundational principles of HTTP. This is not surprising considering the principle author of REST, Roy Fielding, was also a contributor to the HTTP specification. REST HTTP verbs always act upon a resource. Operations on a resource impact the state of the resource as it is transferred by a REST endpoint call. This allows for the caching functionality of HTTP to work optimally. For example, GET will always return the same resource until a PUT is executed on the resource. When PUT is used, the cached resource is replaced with the updated resource.

With REST the updateOrder endpoint would look like the following.

```jsx
PUT /order/2197 HTTP/2

{"date": "20220505"}
```

Where the proper HTTP verb is used and the URL path uniquely identifies the resource. These seem like small differences, but maximizing HTTP pays dividends by making it easy for HTTP infrastructure, such as caching, to work properly.

There are several other pieces of [Fielding's dissertation](https://www.ics.uci.edu/~fielding/pubs/dissertation/top.htm) on REST, such as hypermedia, that are often quoted as being required for a truly "restful" implementation, and these are just as often ignored.

### GraphQL

GraphQL focuses on the manipulation of data instead of a function call (RPC) or a resource (REST). The heart of GraphQL is a query that specifies the desired data and how it should be joined and filtered. GraphQL was developed to address frustration concerning the massive number of REST, or RPC calls, that a web application client needed to make in order to support even a simple UI widget.

Instead of making a call for getting a store, and then a bunch of calls for getting the store's orders and employees, GraphQL would send a single query that would request all of that information in one big JSON response. The server would examine the query, join the desired data, and then filter out anything that was not wanted.

Here is an example GraphQL query.

```jsx
query {
  getOrder(id: "2197") {
    orders(filter: {date: {allofterms: "20220505"}}) {
      store
      description
      orderedBy
    }
  }
}
```

GraphQL helps to remove a lot of the logic for parsing endpoints and mapping requests to specific resources. Basically in GraphQL there is only one endpoint. The query endpoint.

The downside of that flexibility is that the client now has significant power to consume resources on the server. There is no clear boundary on what, how much, or how complicated the aggregation of data is. It also is difficult for the server to implement authorization rights to data as they have to be baked into the data schema. However, there are standards for how to define a complex schema. Common GraphQL packages provide support for schema implementations along with database adaptors for query support.

## Service daemons - PM2

When you run a program from the console, the program will automatically terminate when you close the console or if the computer restarts. In order to keep programs running after a shutdown you need to register it as a **daemon**. The term daemon comes from the idea of something that is always there working in the background. Hopefully you only have good daemons running in your background.

We want our web services to continue running as a daemon. We would also like an easy way to start and stop our services. That is what [Process Manager 2](https://pm2.keymetrics.io/docs/usage/quick-start/) (PM2) does.

PM2 is already installed on your production server as part of the AWS AMI that you selected when you launched your server. Additionally, the deployment scripts found with the Simon projects automatically modify PM2 to register and restart your web services. That means you should not need to do anything with PM2. However, if you run into problems such as your services not running, then here are some commands that you might find useful.

You can SSH into your server and see PM2 in action by running the following command.

```bash
pm2 ls
```

This should print out the two services, simon and startup, that are configured to run on your web server.

You can try some of the other commands, but only if you understand what they are doing. Using them incorrectly could cause your web services to stop working.

| Command | Purpose |
| --- | --- |
| pm2 ls | List all of the hosted node processes |
| pm2 monit | Visual monitor |
| pm2 start index.js -n simon | Add a new process with an explicit name |
| pm2 start index.js -n startup -- 4000 | Add a new process with an explicit name and port parameter |
| pm2 stop simon | Stop a process |
| pm2 restart simon | Restart a process |
| pm2 delete simon | Delete a process from being hosted |
| pm2 delete all | Delete all processes |
| pm2 save | Save the current processes across reboot |
| pm2 restart all | Reload all of the processes |
| pm2 restart simon --update-env | Reload process and update the node version to the current environment definition |
| pm2 update | Reload pm2 |
| pm2 start env.js --watch --ignore-watch="node_modules" | Automatically reload service when index.js changes |
| pm2 describe simon | Describe detailed process information |
| pm2 startup | Displays the command to run to keep PM2 running after a reboot. |
| pm2 logs simon | Display process logs |
| pm2 env 0 | Display environment variables for process. Use pm2 ls to get the process ID |

## Registering a new web service

If you want to setup another subdomain that accesses a different web service on your web server, you need to follow these steps.

1. Add the rule to the Caddyfile to tell it how to direct requests for the domain.
2. Create a directory and add the files for the web service.
3. Configure PM2 to host the web service.

### Modify Caddyfile

SSH into your server.

Copy the section for the startup subdomain and alter it so that it represents the desired subdomain and give it a different port number that is not currently used on your server. For example:

```
tacos.cs260.click {
  reverse_proxy _ localhost:5000
  header Cache-Control none
  header -server
  header Access-Control-Allow-Origin *
}

```

This tells Caddy that when it gets a request for tacos.cs260.click it will act as a proxy for those requests and pass them on to the web service that is listening on the same machine (localhost), on port 5000. The other settings tell Caddy to return headers that disable caching, hide the fact that Caddy is the server (no reason to tell hackers anything about your server), and to allow any other origin server to make endpoint requests to this subdomain (basically disabling CORS). Depending on what your web service does you may want different settings.

Restart Caddy to cause it to load the new settings.

```
sudo service caddy restart

```

Now Caddy will attempt to proxy the requests, but there is no web service listening on port 5000 and so you will get an error from Caddy if you make a request to tacos.cs260.click.

### Create the web service

Copy the `~/services/startup` directory to a directory that represents the purpose of your service. For example:

```
cp -r ~/services/startup ~/services/tacos

```

If you list the directory you should see an `index.js` file that is the main JavaScript file for your web service. It has the code to listen on the designated network port and respond to requests. The following is the JavaScript that causes the web service to listen on a port that is provided as an argument to the command line.

```
const port = process.argv.length > 2 ? process.argv[2] : 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

```

There is also a directory named `public` that has static HTML/CSS/JavaScript files that your web service will respond with when requested. The `index.js` file enables this with the following code:

```
app.use(express.static('public'));

```

You can start up the web service, listening on port 5000, using Node as follows.

```
node index.js 5000

```

You can now access your web service through the browser, or `curl`.

```
curl https://tacos.cs260.click

```

Caddy will receive the request and map the subdomain name, tacos.cs260.click, to a request for http://localhost:5000. Your web service is listening on port 5000 and so it receives the request and responds.

Stop your web service by pressing CTRL-C in the SSH console that you used to start the service. Now your browser request for your subdomain should return an error again.

### Configure PM2 to host the web service

The problem with running your web service from the console with `node index.js 5000`, is that as soon as you close your SSH session it will terminate all processes you started in that session, including your web service. Instead you need something that is always running in the background to run your web service. This is where daemons come into play. The daemon we use to do this is called PM2.

From your SSH console session run:

```
pm2 ls

```

This will list the web services that you already have registered with PM2. To run your newly created web service under PM2, make sure you are in your service directory, and run the command similar to the following, with the service name and port substituted to your desired values:

```
cd ~/services/tacos
pm2 start index.js -n tacos -- 5000
pm2 save

```

If you run `pm2 ls` again you should see your web service listed. You can now access your subdomain in the browser and see the proper response. PM2 will keep running your service even after you exit your SSH session.

## Development and Production Environments

When working on a commercial web application, it is critical to separate where you develop your application, from where the production release of your application is made publicly available. Often times there are more environments than this, such as staging, internal testing, and external testing environments. If your company is seeking third party security certification (such as SOC2 compliance) they will require that these environments are strictly separated from each other. A developer will not have access to the production environment in order to prevent a developer from nefariously manipulating an entire company asset. Instead, automated integration processes, called **continuous integration (CI)** processes, checkout the application code, lint it, build it, test it, stage it, test it more, and then finally, if everything checks out, **deploy** the application to the production environment, and notify the different departments in the company of the release.

![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/dd9295af-0b67-4b6a-ae14-8f9db23fb67b/d2d9218d-0cda-4806-bd04-48e66b8ce6e6/Untitled.png)

You should never consider your production environment as a place to develop, or experiment with, your application. You may shell into the production environment to configure your server or to debug a production problem, but the deployment of your application should happen using an automated CI process. 

### Automating Deployment

The advantage of using an automated deployment process is that it is reproducible. You don't accidentally delete a file, or misconfigure something with an stray keystroke. Also, having a automated script encourages you to iterate quickly because it is so much easier to deploy your code. You can add a small feature, deploy it out to production, and get feedback within minutes from your users.

- example deploy.sh shell script for deployment of node.js server
    
    ```bash
    while getopts k:h:s: flag
    do
        case "${flag}" in
            k) key=${OPTARG};;
            h) hostname=${OPTARG};;
            s) service=${OPTARG};;
        esac
    done
    
    if [[ -z "$key" || -z "$hostname" || -z "$service" ]]; then
        printf "\nMissing required parameter.\n"
        printf "  syntax: deployService.sh -k <pem key file> -h <hostname> -s <service>\n\n"
        exit 1
    fi
    
    printf "\n----> Deploying $service to $hostname with $key\n"
    
    # Step 1
    printf "\n----> Build the distribution package\n"
    rm -rf dist
    mkdir dist
    cp -r public dist
    cp *.js dist
    cp *.json dist
    
    # Step 2
    printf "\n----> Clearing out previous distribution on the target\n"
    ssh -i "$key" ubuntu@$hostname << ENDSSH
    rm -rf services/${service}
    mkdir -p services/${service}
    ENDSSH
    
    # Step 3
    printf "\n----> Copy the distribution package to the target\n"
    scp -r -i "$key" dist/* ubuntu@$hostname:services/$service
    
    # Step 4
    printf "\n----> Deploy the service on the target\n"
    ssh -i "$key" ubuntu@$hostname << ENDSSH
    bash -i
    cd services/${service}
    npm install
    pm2 restart ${service}
    ENDSSH
    
    # Step 5
    printf "\n----> Removing local copy of the distribution package\n"
    rm -rf dist
    ```
    

## Uploading Files

Web applications often need to upload one or more files from the frontend application running in the browser to the backend service. We can accomplish this by using the HTML `input` element of type `file` on the frontend, and the `Multer` NPM package on the backend.

### Frontend Code

The following frontend code registers and event handler for when the selected file changes and only accepts files of type `.png, .jpeg, or .jpg`. We also create an `img` placeholder element that will display the uploaded image once it has been stored on the server.

```html
<html lang="en">
  <body>
    <h1>Upload an image</h1>
    <input
      type="file"
      id="fileInput"
      name="file"
      accept=".png, .jpeg, .jpg"
      onchange="uploadFile(this)"
    />
    <div>
      <img style="padding: 2em 0" id="upload" />
    </div>
    <script defer src="frontend.js"></script>
  </body>
</html>
```

The frontend JavaScript handles the uploading of the file to the server and then uses the filename returned from the server to set the `src` attribute of the image element in the DOM. If an error happens then an alert is displayed to the user.

```jsx
async function uploadFile(fileInput) {
  const file = fileInput.files[0];
  if (file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    if (response.ok) {
      document.querySelector('#upload').src = `/file/${data.file}`;
    } else {
      alert(data.message);
    }
  }
}
```

### Backend code

In order to build storage support into our server, we first install the `Multer` NPM package to our project. There are other NPM packages that we can chose from, but Multer is commonly used. From your project directory, run the following console command.

```bash
npm install multer
```

Multer handles reading the file from the HTTP request, enforcing the size limit of the upload, and storing the file in the `uploads` directory. Additionally our service code does the following:

- Handles requests for static files so that we can serve up our frontend code.
- Handles errors such as when the 64k file limit is violated.
- Provides a `GET` endpoint to serve up a file from the uploads directory.

```jsx
const express = require('express');
const multer = require('multer');

const app = express();

app.use(express.static('public'));

const upload = multer({
  storage: multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
      const filetype = file.originalname.split('.').pop();
      const id = Math.round(Math.random() * 1e9);
      const filename = `${id}.${filetype}`;
      cb(null, filename);
    },
  }),
  limits: { fileSize: 64000 },
});

app.post('/upload', upload.single('file'), (req, res) => {
  if (req.file) {
    res.send({
      message: 'Uploaded succeeded',
      file: req.file.filename,
    });
  } else {
    res.status(400).send({ message: 'Upload failed' });
  }
});

app.get('/file/:filename', (req, res) => {
  res.sendFile(__dirname + `/uploads/${req.params.filename}`);
});

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    res.status(413).send({ message: err.message });
  } else {
    res.status(500).send({ message: err.message });
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
```

### Where you store your files

You should take serious thought about where you store your files. Putting files on your server is not a very good production level solution for the following reasons.

1. You only have so much available space. Your server only has 8 GB by default. Once you use up all your space then your server will fail to operate correctly and you may need to rebuild your server.
2. In a production system, servers are transient and are often replaced as new versions are released, or capacity requirements change. That means you will lose any state that you store on your server.
3. The server storage is not usually backed up. If the server fails for any reason, you will lose your customer's data.
4. If you have multiple application servers then you can't assume that the server you uploaded the data to is going to be the one you request a download from.

Instead you want to use a dedicated storage service that has durability guarantees, is not tied to your compute capacity, and can be accessed by multiple application servers.

## Storage Services

Web applications commonly need to store files associated with the application or the users of the application. This includes files such as images, user uploads, documents, and movies. Files usually have an ID, some metadata, and the bytes representing the file itself. These can be stored using a database service, but usually that is overkill and a simpler solution will be cheaper.

It might be tempting to store files directly on your server. This is usually a bad idea for several reasons.

1. Your server has limited drive space. If you server runs out of drive space your entire application will fail.
2. You should consider your server as being ephemeral, or temporary. It can be thrown away and replaced by a copy at any time. If you start storing files on the server, then your server has state that cannot be easily replaced.
3. You need backup copies of your application and user files. If you only have one copy of your files on your server, then they will disappear when your server disappears, and you must always assume that your server will disappear.

Instead you want to use a storage service that is specifically designed to support production storage and delivery of files.

### AWS S3

There are many such solutions out there, but one of the most popular ones is [AWS S3](https://aws.amazon.com/s3/). S3 provides the following advantages:

1. It has unlimited capacity
2. You only pay for the storage that you use
3. It is optimized for global access
4. It keeps multiple redundant copies of every file
5. You can version the files
6. It is performant
7. It supports metadata tags
8. You can make your files publicly available directly from S3
9. You can keep your files private and only accessible to your application

You can find detailed information about using AWS S3 with Node.js on the [AWS website](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/getting-started-nodejs.html). Generally, the steps you need to take include:

1. Creating a S3 bucket to store your data in.
2. Getting credentials so that your application can access the bucket.
3. [Using](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/setting-credentials-node.html) the credentials in your application.
4. Using the [SDK](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/s3-example-creating-buckets.html) to write, list, read, and delete files from the bucket.

<aside>
⚠️ Make sure that you do not include your credentials in your code. If you check your credentials into your GitHub repository they will immediately be stolen and used by hackers to take over your AWS account. This may result in significant monetary damage to you.

</aside>

## Data Services and MongoDB

Web applications commonly need to store application and user data persistently. The data can be many things, but it is usually a representation of complex interrelated objects. This includes things like a user profile, organizational structure, game play information, usage history, billing information, peer relationship, library catalog, and so forth.

Historically, SQL databases have served as the general purpose data service solution, but starting around 2010, specialty data services that better support document, graph, JSON, time, sequence, and key-value pair data began to take significant roles in applications from major companies. These data services are often called NoSQL solutions because they do not use the general purpose relational database paradigms popularized by SQL databases. However, they all have very different underlying data structures, strengths, and weaknesses. That means that you should not simply split all of the possible data services into two narrowly defined boxes, SQL and NoSQL, when you are considering the right data service for your application.

Here is a list of some of the popular data services that are available.

| Service | Specialty |
| --- | --- |
| MySQL | Relational queries |
| Redis | Memory cached objects |
| ElasticSearch | Ranked free text |
| MongoDB | JSON objects |
| DynamoDB | Key value pairs |
| Neo4J | Graph based data |
| InfluxDB | Time series data |

## MongoDB

Mongo increases developer productivity by using JSON objects as its core data model. This makes it easy to have an application that uses JSON from the top to the bottom of the technology stack. A mongo database is made up of one or more collections that each contain JSON documents. You can think of a collection as a large array of JavaScript objects, each with a unique ID. The following is a sample of a collection of houses that are for rent.

```jsx
[
  {
    _id: '62300f5316f7f58839c811de',
    name: 'Lovely Loft',
    summary: 'A charming loft in Paris',
    beds: 1,
    last_review: {
      $date: '2022-03-15T04:06:17.766Z',
    },
    price: 3000,
  },
  {
    _id: '623010b97f1fed0a2df311f8',
    name: 'Infinite Views',
    summary: 'Modern home with infinite views from the infinity pool',
    property_type: 'House',
    beds: 5,
    price: 250,
  },
];
```

Unlike relational databases that require a rigid table definition where each column must be strictly typed and defined beforehand, Mongo has no strict schema requirements. Each document in the collection usually follows a similar schema, but each document may have specialized fields that are present, and common fields that are missing. This allows the schema of a collection to morph organically as the data model of the application evolves. To add a new field to a Mongo collection you just insert the field into the documents as desired. If the field is not present, or has a different type in some documents, then the document simply doesn't match the query criteria when the field is referenced.

The query syntax for Mongo also follow a JavaScript-inspired flavor. Consider the following queries on the houses for rent collection that was shown above.

```jsx
// find all houses
db.house.find();

// find houses with two or more bedrooms
db.house.find({ beds: { $gte: 2 } });

// find houses that are available with less than three beds
db.house.find({ status: 'available', beds: { $lt: 3 } });

// find houses with either less than three beds or less than $1000 a night
db.house.find({ $or: [(beds: { $lt: 3 }), (price: { $lt: 1000 })] });

// find houses with the text 'modern' or 'beach' in the summary
db.house.find({ summary: /(modern|beach)/i });
```

### Using MongoDB in your application

📖 **Deeper dive reading**: [MongoDB tutorial](https://www.mongodb.com/developer/languages/javascript/node-crud-tutorial/)

The first step to using Mongo in your application is to install the `mongodb` package using NPM.

```bash
➜ npm install mongodb
```

With that done, you then use the `MongoClient` object to make a client connection to the database server. This requires a username, password, and the hostname of the database server.

```jsx
const { MongoClient } = require('mongodb');

const userName = 'holowaychuk';
const password = 'express';
const hostname = 'mongodb.com';

const url = `mongodb+srv://${userName}:${password}@${hostname}`;

const client = new MongoClient(url);
```

With the client connection you can then get a database object and from that a collection object. The collection object allows you to insert, and query for, documents. You do not have to do anything special to insert a JavaScript object as a Mongo document. You just call the `insertOne` function on the collection object and pass it the JavaScript object. When you insert a document, if the database or collection does not exist, Mongo will automatically create them for you. When the document is inserted into the collection it will automatically be assigned a unique ID.

```jsx
const collection = client.db('rental').collection('house');

const house = {
  name: 'Beachfront views',
  summary: 'From your bedroom to the beach, no shoes required',
  property_type: 'Condo',
  beds: 1,
};
await collection.insertOne(house);
```

To query for documents you use the `find` function on the collection object. Note that the find function is asynchronous and so we use the `await` keyword to wait for the promise to resolve before we write them out to the console.

```jsx
const cursor = collection.find();
const rentals = await cursor.toArray();
rentals.forEach((i) => console.log(i));
```

If you do not supply any parameters to the `find` function then it will return all documents in the collection. In this case we only get back the single document that we previously inserted. Notice that the automatically generated ID is returned with the document.

**Output**

```jsx
[
  {
    _id: new ObjectId('639a96398f8de594e198fc13'),
    name: 'Beachfront views',
    summary: 'From your bedroom to the beach, no shoes required',
    property_type: 'Condo',
    beds: 1,
  },
];
```

You can provide a query and options to the `find` function. In the example below we query for a `property_type` of Condo that has less than two bedrooms. We also specify the options to sort by descending price, and limit our results to the first 10 documents.

```jsx
const query = { property_type: 'Condo', beds: { $lt: 2 } };

const options = {
  sort: { price: -1 },
  limit: 10,
};

const cursor = collection.find(query, options);
const rentals = await cursor.toArray();
rentals.forEach((i) => console.log(i));
```

The query matches the document that we previously inserted and so we get the same result as before.

There is a lot more functionality that MongoDB provides, but this is enough to get you started. If you are interested you can explore the tutorials on their [website](https://www.mongodb.com/docs/).

### Managed services

Historically each application development team would have developers that managed the data service. Those developers would acquire hardware, install the database software, monitor the memory, cpu, and disk space, control the data schema, and handle migrations and upgrades. Much of this work has now moved to services that are hosted and managed by a 3rd party. This relieves the development team from much of the day-to-day maintenance. The team can instead focus more on the application and less on the infrastructure. With a managed data service you simply supply the data and the service grows, or shrinks, to support the desired capacity and performance criteria.

### MongoDB Atlas

All of the major cloud providers offer multiple data services. For this class we will use the data service provided by MongoDB called [Atlas](https://www.mongodb.com/atlas/database). No credit card or payment is required to set up and use Atlas, as long as you stick to the shared cluster environment.

[MongoDB Atlas sign up](https://www.mongodb.com/atlas/database)

⚠ This [video tutorial](https://www.youtube.com/watch?v=daIH4o75KE8) will step you through the process of creating your account and setting up your database. You really want to watch this video. Note that some of the Atlas website interface may be slightly different, but the basic concepts should all be there in some shape or form. The main steps you need to take are:

1. Create your account.
2. Create a database cluster.
3. Create your root database user credentials. Remember these for later use.
4. ⚠ Set network access to your database to be available from anywhere.
5. Copy the connection string and use the information in your code.
6. Save the connection and credential information in your production and development environments as instructed above.

You can always find the connection string to your Atlas cluster by pressing the `Connect` button from your Database > DataServices view.

### Keeping your keys out of your code

You need to protect your credentials for connecting to your Mongo database. One common mistake is to check them into your code and then post it to a public GitHub repository. Instead you can load your credentials when the application executes. One common way to do that is to have a JSON configuration file that contains the credentials that you dynamically load into the JavaScript that makes the database connection. You then use the configuration file in your development environment and deploy it to your production environment, but you **never** commit it to GitHub.

In order to accomplish this do the following:

1. Create a file named `dbConfig.json` in the same directory as the database JavaScript (e.g. `database.js`) that you use to make database requests.
2. Insert your Mongo DB credentials into the `dbConfig.json` file in JSON format using the following example:
    
    ```json
    {
      "hostname": "cs260.abcdefg.mongodb.net",
      "userName": "myMongoUserName",
      "password": "toomanysecrets"
    }
    ```
    
3. Import the `dbConfig.json` content into your `database.js` file using a Node.js require statement and use the data that it represents to create the connection URL.
    
    ```jsx
    const config = require('./dbConfig.json');
    const url = `mongodb+srv://${config.userName}:${config.password}@${config.hostname}`;
    ```
    

⚠ Make sure you include `dbConfig.json` in your `.gitignore` file so that it does not get pushed up to GitHub.

### Testing the connection on startup

It is nice to know that your connection string is correct before your application attempts to access any data. We can do that when the application starts by making an asynchronous request to ping the database. If that fails then either the connection string is incorrect, the credentials are invalid, or the network is not working. The following is an example of testing the connection.

```jsx
const config = require('./dbConfig.json');

const url = `mongodb+srv://${config.userName}:${config.password}@${config.hostname}`;
const client = new MongoClient(url);
const db = client.db('rental');

(async function testConnection() {
  await client.connect();
  await db.command({ ping: 1 });
})().catch((ex) => {
  console.log(`Unable to connect to database with ${url} because ${ex.message}`);
  process.exit(1);
});
```

If your server is not starting, then check your logs for this exception being thrown.

### Using Mongo from your code

With that all done, you should be good to use Atlas from both your development and production environments. You can test that things are working correctly with the following example.

```jsx
const { MongoClient } = require('mongodb');
const config = require('./dbConfig.json');

async function main() {
  // Connect to the database cluster
  const url = `mongodb+srv://${config.userName}:${config.password}@${config.hostname}`;
  const client = new MongoClient(url);
  const db = client.db('rental');
  const collection = db.collection('house');

  // Test that you can connect to the database
  (async function testConnection() {
    await client.connect();
    await db.command({ ping: 1 });
  })().catch((ex) => {
    console.log(`Unable to connect to database with ${url} because ${ex.message}`);
    process.exit(1);
  });

  // Insert a document
  const house = {
    name: 'Beachfront views',
    summary: 'From your bedroom to the beach, no shoes required',
    property_type: 'Condo',
    beds: 1,
  };
  await collection.insertOne(house);

  // Query the documents
  const query = { property_type: 'Condo', beds: { $lt: 2 } };
  const options = {
    sort: { score: -1 },
    limit: 10,
  };

  const cursor = collection.find(query, options);
  const rentals = await cursor.toArray();
  rentals.forEach((i) => console.log(i));
}

main().catch(console.error);
```

To execute the above example, do the following:

1. Create a directory called `mongoTest`
2. Save the above content to a file named `index.js`
3. Create a file named `dbConfig.json` that contains your database credentials
4. Run `npm init -y`
5. Run `npm install mongodb`
6. Run `node index.js`

This should output something like the following if everything is working correctly.

```jsx
{
_id: new ObjectId("639b51b74ef1e953b884ca5b"),
name: 'Beachfront views',
summary: 'From your bedroom to the beach, no shoes required',
property_type: 'Condo',
beds: 1
}
```

## Authorization Services

https://learn.cs260.click/page/webServices/authorizationServices/authorizationServices_md

[Account creation and login](https://learn.cs260.click/page/webServices/login/login_md)

## Testing and TDD

## [UI Testing](https://learn.cs260.click/page/webServices/uiTesting/uiTesting_md)

Test driven development (TDD) is a proven methodology for accelerating application creation, protecting against regression bugs, and demonstrating correctness. TDD for console based applications and server based code is fairly straight forward. Web application UI code is significantly more complex to test, and using automated tests to drive your UI development is even more difficult.

The problem is that a browser is required to execute UI code. That means you have to actually test the application in the browser. Additionally, every one of the major browsers behaves slightly differently, viewport size makes a big difference, all the code executes asynchronously, network disruptions are common, and then there is the human factor. A human will interact with the browser in very unexpected ways. Clicking where they shouldn't, clicking rapidly, randomly refreshing the browser, flushing cache, not flushing cache, leaving the application up for days on end, switching between tabs, opening the application multiple times, logging in on different tabs, logging out of one tab while still using the application on another tab, or ... on and on. And we haven't even talked about running all the different browsers on all of the possible devices.

Of course the alternative to not test your code doesn't work either. That only means that you have to manually test everything every time you make any change, or you let your users test everything. That is not a good recipe for long term success. 

Fortunately this is a problem that many strong players have been working on for decades now, and the solutions, while not perfect, are getting better and better.

[Selenium](https://www.selenium.dev/) was introduced in 2004 as the first popular tool to automate the browser. However, Selenium is generally considered to be flaky and slow. Flakiness means that a test fails in unpredictable, unreproducible ways. When you need thousands of tests to pass before you can deploy a new feature, even a little flakiness becomes a big problem. If those tests take hours to run then you have an even bigger problem.

The market now has lots of alternatives when considering which automated browser framework to use:

![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/dd9295af-0b67-4b6a-ae14-8f9db23fb67b/61ba20e8-4b9f-49f3-a874-ae33de387744/Untitled.png)

### Automating the browser - Playwright

📖 **Deeper dive reading**: [Playwright and VS Code](https://playwright.dev/docs/getting-started-VSCode)

Playwright has some major advantages. It is backed by Microsoft, it integrates really well with VS Code, and it runs as a Node.js process. It is also considered one of the least flaky of the testing frameworks.

`npm init playwright@latest`

`import { test, expect } from '@playwright/test';`

**Playwright Test for VSCode** extension

example test:

```sql
test('testWelcomeButton', async ({ page }) => {
  // Navigate to the welcome page
  await page.goto('http://localhost:5500/');

  // Get the target element and make sure it is in the correct starting state
  const hello = page.getByTestId('msg');
  await expect(hello).toHaveText('Hello world');

  // Press the button
  const changeBtn = page.getByRole('button', { name: 'change welcome' });
  await changeBtn.click();

  // Expect that the change happened correctly
  await expect(hello).toHaveText('I feel not welcomed');
});
```

### Testing various devices - BrowserStack

BrowserStack lets you pick from a long list of physical devices (iPhone, Android, Mac, Windows) that you can run interactively, or use when driving automated tests with Selenium. When you launch a device it connects the browser interface to a physical device hosted in a data center. You can then use the device to reproduce user reported problems, or validate that your implementation works on that specific device. 

## [Endpoint Testing](https://learn.cs260.click/page/webServices/endpointTesting/endpointTesting_md) with Jest

![There are lots of good testing packages that work well with Express driven services](https://prod-files-secure.s3.us-west-2.amazonaws.com/dd9295af-0b67-4b6a-ae14-8f9db23fb67b/62168b01-12f6-49b7-b41b-abb915b2529d/Untitled.png)

There are lots of good testing packages that work well with Express driven services

### Setup Jest

```bash
npm install jest -D
```

Now, replace the `scripts` section of the `package.json` file with a new command that will run our tests with Jest.

```json
"scripts": {
  "test": "jest"
},
```

To get started with Jest we need a web service. Instead of just listening immediately, we export the express service so our tests can use it

```jsx
**// server.js**
const express = require('express');
const app = express();

// Endpoints

module.exports = app;
```

and we import and start the service in the `index.js` file instead

```jsx
**// index.js**
const app = require('./server');

const port = 8080;
app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
```

A test is created by calling the Jest `**test**` function. Note that you don't need to include a `require` statement to import Jest functions into your code. Jest will automatically import itself when it discovers a test file (`filename.test.js`).

The `test` function takes a description as the first parameter. The description is meant to be human readable. In this case it reads: "test that equal values are equal". The second parameter is the function to call.

Fail:

```jsx
**// store.test.js**
test('that equal values are equal', () => {
  expect(false).toBe(true);
});
```

```bash
➜ npm run test

 FAIL  ./store.test.js
  ✕ that unequal values are not equal (1 ms)

  ● that unequal values are not equal

    expect(received).toBe(expected) // Object.is equality

    Expected: true
    Received: false

      3 |
      4 | test('that unequal values are not equal', () => {
    > 5 |   expect(false).toBe(true);
        |                 ^
      6 | });
      7 |
      8 | // describe('endpoints', () => {

      at Object.toBe (store.test.js:5:17)

Tests:       1 failed, 1 total
```

Pass:

```jsx
**// store.test.js**
test('that equal values are equal', () => {
  expect(true).toBe(true);
});
```

```bash
➜  npm run test

 PASS  ./store.test.js
  ✓ that equal values are equal (1 ms)

Tests:       1 passed, 1 total
```

### Testing endpoints

To test our endpoints we need another package so that we can make HTTP requests without having to actually send them over the network. This is done with the NPM package called `supertest`: `npm install supertest -D`

To make an HTTP request you pass the Express `app` to the `supertestrequest` function and then chain on the HTTP verb function that you want to call, along with the endpoint path. You can then chain on as many `expect` functions as you would like.

```jsx
**// store.test.js**
const request = require('supertest');
const app = require('./server');

test('getStore returns the desired store', (done) => {
  request(app)
    .get('/store/provo')
    .expect(200)
    .expect({ name: 'provo' })
    .end((err) => (err ? done(err) : done()));
});

test('updateStore saves the correct values', (done) => {
  request(app)
    .put('/store/provo')
    .send({ items: ['fish', 'milk'] })
    .expect(200)
    .expect({ items: ['fish', 'milk'], updated: true })
    .end((err) => (err ? done(err) : done()));
});
```

## WebSocket

HTTP is based on a client-server architecture. A client always initiates the request and the server responds. This is great if you are building a global document library connected by hyperlinks, but for many other use cases it just doesn't work. Applications for notifications, distributed task processing, peer-to-peer communication, or asynchronous events need communication that is initiated by two or more connected devices.

For years, web developers created hacks to work around the limitation of the client/server model. This included solutions like having the client frequently pinging the server to see if the server had anything to say, or keeping client-initiated connections open for a very long time as the client waited for some event to happen on the server. Needless to say, none of these solutions were elegant or efficient.

Finally, in 2011 the communication protocol WebSocket was created to solve this problem. The core feature of WebSocket is that it is fully duplexed. This means that after the initial connection is made from a client, using vanilla HTTP, and then upgraded by the server to a WebSocket connection, the relationship changes to a peer-to-peer connection where either party can efficiently send data at any time.

![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/dd9295af-0b67-4b6a-ae14-8f9db23fb67b/1b14cd76-e6fe-4995-8219-bc7e635c83df/Untitled.png)

WebSocket connections are still only between two parties. So if you want to facilitate a conversation between a group of users, the server must act as the intermediary. Each peer first connects to the server, and then the server forwards messages amongst the peers.

![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/dd9295af-0b67-4b6a-ae14-8f9db23fb67b/066305e2-45cd-4ce0-8e93-dd25f01b17cd/Untitled.png)

### Creating a WebSocket conversation

JavaScript running on a browser can initiate a WebSocket connection with the browser's WebSocket API. First you create a WebSocket object by specifying the port you want to communicate on.

You can then send messages with the `send` function, and register a callback using the `onmessage` function to receive messages.

```jsx
const socket = new WebSocket('ws://localhost:9900');

socket.onmessage = (event) => {
  console.log('received: ', event.data);
};

socket.send('I am listening');
```

The server uses the `ws` package to create a WebSocketServer that is listening on the same port the browser is using. By specifying a port when you create the WebSocketServer, you are telling the server to listen for HTTP connections on that port and to automatically upgrade them to a WebSocket connection if the request has a `connection: Upgrade` header.

When a connection is detected it calls the server's `on connection` callback. The server can then send messages with the `send` function, and register a callback using the `on message` function to receive messages.

```jsx
const { WebSocketServer } = require('ws');

const wss = new WebSocketServer({ port: 9900 });

wss.on('connection', (ws) => {
  ws.on('message', (data) => {
    const msg = String.fromCharCode(...data);
    console.log('received: %s', msg);

    ws.send(`I heard you say "${msg}"`);
  });

  ws.send('Hello webSocket');
});
```

### Debugging WebSocket

You can debug both sides of the WebSocket communication with VS Code to debug the server, and Chrome to debug the client. When you do this you will notice that Chrome's debugger has support specifically for working with WebSocket communication.

Server - vscode breakpoints

Client - Network → HTTP Request → Messages

### [Example Chat App](https://github.com/webprogramming260/websocket-chat)

### Chat Client

**HTML**

```jsx
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>WebSocket Chat</title>
    <link rel="stylesheet" href="main.css" />
  </head>
  <body>
    <div class="name">
      <fieldset id="name-controls">
        <legend>My Name</legend>
        <input id="my-name" type="text" />
      </fieldset>
    </div>

    <fieldset id="chat-controls" disabled>
      <legend>Chat</legend>
      <input id="new-msg" type="text" />
      <button onclick="sendMessage()">Send</button>
    </fieldset>
    <div id="chat-text"></div>
  </body>
  <script src="chatClient.js"></script>
</html>
```

**DOM Interaction**

```jsx
const chatControls = document.querySelector('#chat-controls');
const myName = document.querySelector('#my-name');
myName.addEventListener('keyup', (e) => {
  chatControls.disabled = myName.value === '';
});

function appendMsg(cls, from, msg) {
  const chatText = document.querySelector('#chat-text');
  chatText.innerHTML = `<div><span class="${cls}">${from}</span>: ${msg}</div>` + chatText.innerHTML;
}

const input = document.querySelector('#new-msg');
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    sendMessage();
  }
});

function sendMessage() {
  const msgEl = document.querySelector('#new-msg');
  const msg = msgEl.value;
  if (!!msg) {
    appendMsg('me', 'me', msg);
    const name = document.querySelector('#my-name').value;
    socket.send(`{"name":"${name}", "msg":"${msg}"}`);
    msgEl.value = '';
  }
}
```

**WebSocket Connection**

We want to be able to support both secure and non-secure WebSocket connections. To do this we look at the protocol that is currently being used as represented by the `window.location.protocol` variable. If it is non-secure HTTP then we set our WebSocket protocol to be non-secure WebSocket (`ws`). Otherwise we use secure WebSocket (`wss`). We use that to then connect the WebSocket to the same location that we loaded the HTML from by referencing the `window.location.host` variable.

We can notify the user that chat is ready to go by listening to the `onopen` event and appending some text to the display using the `appendMsg` function we created earlier.

When the WebSocket receives a message from a peer it displays it using the `appendMsg` function.

And if the WebSocket closes for any reason we also display that to the user and disable the controls.

```jsx
// Adjust the webSocket protocol to what is being used for HTTP
const protocol = window.location.protocol === 'http:' ? 'ws' : 'wss';
const socket = new WebSocket(`${protocol}://${window.location.host}/ws`);

// Display that we have opened the webSocket
socket.onopen = (event) => {
  appendMsg('system', 'websocket', 'connected');
};

socket.onmessage = async (event) => {
  const text = await event.data.text();
  const chat = JSON.parse(text);
  appendMsg('friend', chat.name, chat.msg);
};

socket.onclose = (event) => {
  appendMsg('system', 'websocket', 'disconnected');
  document.querySelector('#name-controls').disabled = true;
  document.querySelector('#chat-controls').disabled = true;
};
```

### Chat Server

**Web Service**

```jsx
const { WebSocketServer } = require('ws');
const express = require('express');
const app = express();

// Serve up our webSocket client HTML
app.use(express.static('./public'));

const port = process.argv.length > 2 ? process.argv[2] : 3000;
server = app.listen(port, () => {
  console.log(`Listening on ${port}`);
});
```

**WebSocket Server**

When we create our WebSocket we do things a little differently than we did with the simple connection example. Instead of letting the WebSocketServer control both the HTTP connection and the upgrading to WebSocket, we want to use the HTTP connection that Express is providing and handle the upgrade to WebSocket ourselves. This is done by specifying the `noServer` option when creating the WebSocketServer and then handling the `upgrade`notification that occurs when a client requests the upgrade of the protocol from HTTP to WebSocket.

```jsx
// Create a websocket object
const wss = new WebSocketServer({ noServer: true });

// Handle the protocol upgrade from HTTP to WebSocket
server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, function done(ws) {
    wss.emit('connection', ws, request);
  });
});
```

**Forwarding Messages**

With the WebSocket server we can use the `connection`, `message`, and `close` events to forward messages between peers. On connection we insert an object representing the connection into a list of all connections from the chat peers. Then when a message is received we loop through the peer connections and forward it on to everyone except the peer who initiated the request. Finally we remove a connection from the peer connection list when it is closed.

```jsx
// Keep track of all the connections so we can forward messages
let connections = [];

wss.on('connection', (ws) => {
  const connection = { id: connections.length + 1, alive: true, ws: ws };
  connections.push(connection);

  // Forward messages to everyone except the sender
  ws.on('message', function message(data) {
    connections.forEach((c) => {
      if (c.id !== connection.id) {
        c.ws.send(data);
      }
    });
  });

  // Remove the closed connection so we don't try to forward anymore
  ws.on('close', () => {
    connections.findIndex((o, i) => {
      if (o.id === connection.id) {
        connections.splice(i, 1);
        return true;
      }
    });
  });
});
```

**Keeping connections alive**

A WebSocket connection will eventually close automatically if no data is sent across it. In order to prevent that from happening the WebSocket protocol supports the ability to send a `ping` message to see if the peer is still there and receive `pong` responses to indicate the affirmative.

It make this work we use `setInterval` to send out a ping every 10 seconds to each of our peer connections and clean up any connections that did not response to our previous ping.

```jsx
setInterval(() => {
  connections.forEach((c) => {
    // Kill any connection that didn't respond to the ping last time
    if (!c.alive) {
      c.ws.terminate();
    } else {
      c.alive = false;
      c.ws.ping();
    }
  });
}, 10000);

```

In our `connection` handler we listen for the `pong` response and mark the connection as alive.

```jsx
// Respond to pong messages by marking the connection alive
ws.on('pong', () => {
  connection.alive = true;
});
```

Any connection that did not respond will remain in the not alive state and get cleaned up on the next pass.

## Web Frameworks

📖 **Deeper dive reading**: [MDN Introduction to client-side frameworks](https://developer.mozilla.org/en-US/docs/Learn/Tools_and_testing/Client-side_JavaScript_frameworks/Introduction)

Web frameworks seek to make the job of writing web applications easier by providing tools for completing common application tasks. This includes things like modularizing code, creating single page applications, simplifying reactivity, and supporting diverse hardware devices.

Some frameworks take things beyond the standard web technologies (HTML, CSS, JavaScript) and create new hybrid file formats that combine things like HTML and JavaScript into a single file. Examples of this include React JSX, Vue SFC, and Svelte files. Abstracting away the core web file formats puts the focus on functional components rather than files.

There are lots of web frameworks to choose from and they evolve all the time. You can view the latest popularity poll at [StateOfJS](https://stateofjs.com/).

Each framework has advantages and disadvantages. Some are very prescriptive (opinionated) about how to do things, some have major institutional backing, and others have a strong open source community. Other factors you want to consider include how easy it is to learn, how it impacts productivity, how performant it is, how long it takes to build, and how actively the framework is evolving.

![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/dd9295af-0b67-4b6a-ae14-8f9db23fb67b/52851750-0863-46b3-84f9-c477b5d04621/Untitled.png)

### Vue

[Vue](https://vuejs.org/) combines HTML, CSS, and JavaScript into a single file. HTML is represented by a `template` element that can be aggregated into other templates.

**SFC (Single-File Component)**

```html
<script>
  export default {
    data() {
      return {
        name: 'world',
      };
    },
  };
</script>

<style>
  p {
    color: green;
  }
</style>

<template>
  <p>Hello {{ name }}!</p>
</template>
```

### Svelte

Like Vue, [Svelte](https://svelte.dev/) combines HTML, CSS, and JavaScript into a single file. The difference here is that Svelte requires a transpiler to generate browser-ready code, instead of a runtime virtual DOM.

**Svelte file**

```html
<script>
  let name = 'world';
</script>

<style>
  p {
    color: green;
  }
</style>

<p>Hello {name}!</p>
```

### React

React combines JavaScript and HTML into its component format. CSS must be declared outside of the JSX file. The component itself highly leverages the functionality of JavaScript and can be represented as a function or class.

**JSX**

```jsx
import 'hello.css';

const Hello = () => {
  let name = 'world';

  return <p>Hello {name}</p>;
};
```

**CSS**

```css
// hello.css
p {
  color: green;
}
```

### Angular component

An Angular component defines what JavaScript, HTML, and CSS are combined together. This keeps a fairly strong separation of files that are usually grouped together in a directory rather than using the single file representation.

**JS**

```jsx
@Component({
  selector: 'app-hello-world',
  templateUrl: './hello-world.component.html',
  styleUrls: ['./hello-world.component.css'],
})
export class HelloWorldComponent {
  name: string;
  constructor() {
    this.name = 'world';
  }
}
```

**HTML**

```html
<p>hello {{name}}</p>
```

**CSS**

```css
p {
  color: green;
}
```

## React

!https://raw.githubusercontent.com/webprogramming260/.github/main/profile/webFrameworks/react/introduction/reactLogo.png

🎥 **Instruction video**: [React introduction](https://youtu.be/R2I89JGr2TM)

📖 **Recommended reading**:

- [MDN React Introduction Tutorial](https://developer.mozilla.org/en-US/docs/Learn/Tools_and_testing/Client-side_JavaScript_frameworks/React_getting_started)
- [React Quick Start](https://react.dev/learn#components)

React, and its associated projects, provide a powerful web programming framework. The name React comes from its focus on making reactive web page components that automatically update based on user interactions or changes in the underlying data.

React was created by Jordan Walke for use at Facebook in 2011. It was first used with Facebook's news feed and then as the main framework for Instagram. Shortly thereafter, Facebook open sourced the framework and it was quickly adopted by many popular web applications.

React abstracts HTML into a JavaScript variant called [JSX](https://reactjs.org/docs/introducing-jsx.html). JSX is converted into valid HTML and JavaScript using a preprocessor called [Babel](https://babeljs.io/). 

- Example:
    
    The following is a JSX file. Notice that it mixes both HTML and JavaScript into a single representation.
    
    ```jsx
    const i = 3;
    const list = (
      <ol class='big'>
        <li>Item {i}</li>
        <li>Item {3 + i}</li>
      </ol>
    );
    ```
    
    Babel will convert that into valid JavaScript:
    
    ```jsx
    const i = 3;
    const list = React.createElement(
      'ol',
      { class: 'big' },
      React.createElement('li', null, 'Item ', i),
      React.createElement('li', null, 'Item ', 3 + i)
    );
    ```
    
    The `React.createElement` function will then generate DOM elements and monitor the data they represent for changes. When a change is discovered, React will trigger dependent changes.
    

### Components

📖 **Recommended reading**: [React.dev - Your First Component](https://react.dev/learn/your-first-component)

React **components** allow you to modularize the functionality of your application. This allows the underlying code to directly represent the components that a user interacts with. It also enables code reuse as common application UI components often show up repeatedly.

One of the primary purposes of a component is to generate the user interface. This is done with the component's `**render`** function. Whatever is returned from the `render` function is inserted into the component HTML element.

- As a simple example, a JSX file containing a React component element named `Demo` would cause React to load the `Demo` component, call the `render` function, and insert the result into the place of the `Demo` element.
    
    JSX
    
    ```jsx
    <div>
      Component: <Demo />
    </div>
    ```
    
    React component
    
    ```jsx
    function Demo() {
      const who = 'world';
      return <b>Hello {who}</b>;
    }
    ```
    
    Resulting HTML
    
    ```html
    <div>Component: <b>Hello world</b></div>
    ```
    
- Class component syntax is deprecated
    
    ```jsx
    class Hello extends React.Component {
      render() {
        return <p>Hello World</p>;
      }
    }
    ```
    

**Steps to building a component:**

1. Export the component
    1. The `export default` prefix is a [standard JavaScript syntax](https://developer.mozilla.org/docs/web/javascript/reference/statements/export) (not specific to React). It lets you mark the main function in a file so that you can later import it from other files.
2. Define the function
    
    <aside>
    ⚠️ React components are regular JavaScript functions, but their names must start with a capital letter or they won’t work! This is how React knows we are referring to a component and not a normal HTML tag
    
    </aside>
    
3. Add markup
    1. The component function returns JSX markup code
    2. Return statements can be written all on one line, but if your markup isn’t all on the same line as the `return` keyword, you must wrap it in a pair of parentheses

### Properties

React components also allow you to pass information to them in the form of element **properties**. The component receives the properties in its constructor and then can display them when it renders.

- Example:
    
    JSX
    
    ```html
    <div>Component: <Demo who="Walke" /><div>
    ```
    
    React component
    
    ```jsx
    function Demo(props) {
      return <b>Hello {props.who}</b>;
    }
    ```
    
    Resulting HTML
    
    ```html
    <div>Component: <b>Hello Walke</b></div>
    ```
    

 In React, it’s conventional to use `onSomething` names for props which represent events and `handleSomething` for the function definitions which handle those events.

### State

In addition to properties, a component can have internal **state**. Component state is created by calling the `**React.useState**` hook function. The `useState` function returns a variable that contains the current state and a function to update the state. 

- Example:
    
    The following example creates a state variable called `clicked` and toggles the click state in the `updateClicked` function that gets called when the paragraph text is clicked.
    
    ```jsx
    const Clicker = () => {
      const [clicked, updateClicked] = React.useState(false);
    
      const onClicked = (e) => {
        updateClicked(!clicked);
      };
    
      return <p onClick={(e) => onClicked(e)}>clicked: {`${clicked}`}</p>;
    };
    
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<Clicker />);
    
    ```
    
    class style equivalent:
    
    ```jsx
    class Clicker extends React.Component {
      constructor(props) {
        super(props);
        this.state = {
          clicked: false,
        };
      }
      onClicked() {
        this.setState({
          clicked: !this.state.clicked,
        });
      }
      render() {
        return <p onClick={(e) => this.onClicked(e)}>clicked: {`${this.state.clicked}`}</p>;
      }
    }
    
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<Clicker />);
    ```
    

You should note that you can use JSX even without a function. A simple variable representing JSX will work anyplace you would otherwise provide a component.

```jsx
const hello = <div>Hello</div>;

ReactDOM.render(hello, document.getElementById('root'));
```

### Reactivity

Making the UI react to changes in user input or data, is one of the architectural foundations of React. React enables reactivity with three major pieces of a React component: `**props**`, `**state**`, and `**render**`.

When a component's JSX is rendered, React parses the JSX and creates a list of any references to the component's `state` or `prop` objects. React then monitors those objects and if it detects that they have changed it will call the component's `render` function so that the impact of the change is visualized.

Be careful about your assumptions of when state is updated. Just because you called `updateState` does not mean that you can access the updated state on the next line of code. The update happens asynchronously, and therefore you never really know when it is going to happen. You only know that it will eventually happen.

### React hooks

📖 **Recommended reading**: [Reactjs.org - Hooks Overview](https://reactjs.org/docs/hooks-overview.html)

React hooks allow React function style components to be able to do everything that a class style component can do and more. Additionally, as new features are added to React they are including them as hooks. This makes function style components the preferred way of doing things in React.

We’ve already seen the `useState` hook.

The `useEffect` hook allows you to represent lifecycle events. For example, if you want to run a function every time the component completes rendering, you could do the following.

```jsx
function UseEffectHookDemo() {
  React.useEffect(() => {
    console.log('rendered');
  });

  return <div>useEffectExample</div>;
}

ReactDOM.render(<UseEffectHookDemo />, document.getElementById('root'));
```

You can also take action when the component cleans up by returning a cleanup function from the function registered with `useEffect`. In the following example, every time the component is clicked the state changes and so the component is rerendered. This causes both the cleanup function to be called in addition to the hook function. If the function was not rerendered then only the cleanup function would be called.

```jsx
function UseEffectHookDemo() {
  const [count, updateCount] = React.useState(0);
  React.useEffect(() => {
    console.log('rendered');

    return function cleanup() {
      console.log('cleanup');
    };
  });

  return <div onClick={() => updateCount(count + 1)}>useEffectExample {count}</div>;
}

ReactDOM.render(<UseEffectHookDemo />, document.getElementById('root'));
```

This is useful when you want to create side effects for things such as tracking when a component is displayed or hidden, or creating and disposing of resources.

You can control what triggers a `useEffect` hook by specifying its dependencies.

In the following example we have two state variables, but we only want the `useEffect` hook to be called when the component is initially called and when the first variable is clicked. To accomplish this you pass an array of dependencies as a second parameter to the `useEffect`call.

```jsx
function UseEffectHookDemo() {
  const [count1, updateCount1] = React.useState(0);
  const [count2, updateCount2] = React.useState(0);

  React.useEffect(() => {
    console.log(`count1 effect triggered ${count1}`);
  }, [count1]);

  return (
    <ol>
      <li onClick={() => updateCount1(count1 + 1)}>Item 1 - {count1}</li>
      <li onClick={() => updateCount2(count2 + 1)}>Item 2 - {count2}</li>
    </ol>
  );
}

ReactDOM.render(<UseEffectHookDemo />, document.getElementById('root'));

```

If you specify an empty array `[]` as the hook dependency then it is only called when the component is first rendered.

<aside>
⚠️ Note that hooks can only be used in function style components and must be called at the top scope of the function. That means a hook cannot be called inside of a loop or conditional. This restriction ensures that hooks are always called in the same order when a component is rendered.

</aside>

## Toolchains

As web programming becomes more and more complex it became necessary to abstract away some of that complexity with a series of tools. Some common functional pieces in a web application tool chain include:

- **Code repository** - Stores code in a shared, versioned, location.
- **Linter** - Removes, or warns, of non-idiomatic code usage.
- **Prettier** - Formats code according to a shared standard.
- **Transpiler** - Compiles code into a different format. For example, from JSX to JavaScript, TypeScript to JavaScript, or SCSS to CSS.
- **Polyfill** - Generates backward compatible code for supporting old browser versions that do not support the latest standards.
- **Bundler** - Packages code into bundles for delivery to the browser. This enables compatibility (for example with ES6 module support), or performance (with lazy loading).
- **Minifier** - Removes whitespace and renames variables in order to make code smaller and more efficient to deploy.
- **Testing** - Automated tests at multiple levels to ensure correctness.
- **Deployment** - Automated packaging and delivery of code from the development environment to the production environment.

## Vite

📖 **Deeper dive reading**: [Vite](https://vitejs.dev/guide/)

Vite bundles your code quickly, has great debugging support, and allows you to easily support JSX, TypeScript, and different CSS flavors.

To get started:

```bash
npm create vite@latest ProjectName -- --template react
cd ProjectName
npm install
npm run dev
```

| Directory | File | Purpose |
| --- | --- | --- |
| ./ |  |  |
|  | index.html | Primary page for the application. This is the starting point to load all of the JSX components beginning with main.jsx. |
|  | package.json | NPM definition for package dependencies and script commands. This is what maps npm run dev to actually start up Vite. |
|  | package-lock.json | Version constraints for included packages (do not edit this). |
|  | vite.config.js | Configuration setting for Vite. Specifically this sets up React for development. |
| ./public |  |  |
|  | vite.svg | Vite logo for use as favicon and for display in the app. |
| ./src |  |  |
|  | main.jsx | Entry point for code execution. This simply loads the App component found in App.jsx. |
|  | index.css | CSS for the entire application. |
|  | App.jsx | JSX for top level application component. This displays the logs and implements the click counter. |
|  | App.css | CSS for the top level application component. |
| ./src/assets |  |  |
|  | react.svg | React logo for display in the app. |

<aside>
☝ The `Vite` CLI uses the `.jsx` extension for JSX files instead of the JavaScript `.js` extension. The Babel transpiler will work with either one, but some editor tools will work differently based upon the extension. For this reason, you should prefer `.jsx` for files that contain JSX.

</aside>

When you execute `npm run dev` you are bundling the code to a temporary directory that the Vite debug HTTP server loads from. When you want to bundle your application so that you can deploy to a production environment you need to run `npm run build`. This executes the `build`script found in your `package.json` and invokes the `Vite` CLI. `vite build` transpiles, minifies, injects the proper JavaScript, and then outputs everything to a deployment-ready version contained in a distribution subdirectory named `dist`.

## Router

🔑 **Required reading**: [React Router DOM Tutorial](https://blog.webdevsimplified.com/2022-07/react-router/)

A web framework **router** provides essential functionality for **single-page** applications. With a multiple-webpage application the headers, footers, navigation, and common components must be either duplicated in each HTML page, or injected before the server sends the page to the browser. With a single page application, the browser only loads one HTML page and then JavaScript is used to manipulate the DOM and give it the appearance of multiple pages. The router defines the routes a user can take through the application, and automatically manipulates the DOM to display the appropriate framework components.

React does not have a standard router package, and there are many that you can choose from. We will use [react-router-dom](https://www.npmjs.com/package/react-router-dom) Version 6. The simplified routing functionality of React-router-dom derives from the project [react-router](https://www.npmjs.com/package/react-router) for its core functionality. Do not confuse the two, or versions of react-router-dom before version 6, when reading tutorials and documentation.

A basic implementation of the router consists of a `BrowserRouter` component that encapsulates the entire application and controls the routing action. The `Link`, or `NavLink`, component captures user navigation events and modifies what is rendered by the `Routes`component by matching up the `to` and `path` attributes.

```bash
import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"

// Inject the router into the application root DOM element
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // BrowserRouter component that controls what is rendered
  // NavLink component captures user navigation requests
  // Routes component defines what component is routed to
  <BrowserRouter>
    <div className='app'>
      <nav>
        <NavLink to='/'>Home</Link>
        <NavLink to='/about'>About</Link>
        <NavLink to='/users'>Users</Link>
      </nav>

      <main>
        <Routes>
          <Route path='/' element={<Home />} exact />
          <Route path='/about' element={<About />} />
          <Route path='/users' element={<Users />} />
          <Route path='*' element={<Navigate to='/' replace />} />
        </Routes>
      </main>
    </div>
  </BrowserRouter>
);
```

Generally you will import your router in the `index.js` page of your application and it will wrap your `App` component.

---

### Routing

You can use dynamic routing

```html
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/books" element={<BookList />} />
  <Route path="/books/:id" element={<Book />} />
</Routes>
```

```jsx
import { useParams } from "react-router-dom"

export function Book() {
  const { id } = useParams()
  return <h1>Book {id}</h1>
}
```

The React Router as of version 6 determines which path out of many that match using an algorithm similar to CSS specificity (most specific = least amount of dynamic elements and still matches)

```html
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/books" element={<BookList />} />
  <Route path="/books/:id" element={<Book />} />
  <Route path="/books/new" element={<NewBook />} />
  <Route path="*" element={<NotFound />} />
</Routes>
```

You can also nest routes:

```html
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/books">
    <Route index element={<BookList />} />
    <Route path=":id" element={<Book />} />
    <Route path="new" element={<NewBook />} />
  </Route>
  <Route path="*" element={<NotFound />} />
</Routes>
```

If you pass an `element` prop to a parent route it will render that component for every single child `Route` which means you can put a shared nav or other shared components on every child page with ease.

```html
<Route path="/books" element={<BooksLayout />}>
  <Route index element={<BookList />} />
  <Route path=":id" element={<Book />} />
  <Route path="new" element={<NewBook />} />
</Route>
```

The `Outlet` component is essentially a placeholder component that will render whatever our current page’s content is. Then whichever child `Route` is matched will be rendered wherever the `Outlet` component is placed inside our layout component.

You can also just share layouts with React Router is by wrapping child `Route`components in a parent `Route` that only defines an `element` prop and no `path` prop. This technique of wrapping multiple `Route` components in a parent `Route` component with no `path` prop is useful if you want those routes to share a single layout even if they don’t have a similar path.

```html
  <Route element={<OtherLayout />}>
    <Route path="/contact" element={<Contact />} />
    <Route path="/about" element={<About />} />
  </Route>
```

You can have multiple `Routes` to render two different sections of content that both depend on the same URL path of the application:

```html
  <aside>
    <Routes>
      <Route path="/books" element={<BookSidebar />}>
    </Routes>
  </aside>

  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/books" element={<BookList />} />
  </Routes>
```

Another thing that you can do with multiple `Routes` components is hardcode the `location` prop.

```html
<Routes location="/books">  <Route path="/books" element={<BookSidebar />}></Routes>
```

By hardcoding a `location` prop like this we are overriding the default behavior or React Router so no matter what the URL of our page is this `Routes` component will match its `Route` as if the URL was `/books`.

---

### Navigation

Basic `**Link**` component with absolute paths:

```html
<Link to="/">Home</Link>
<Link to="/books">Books</Link>
```

You can also use links relative to the current component being rendered:

```html
<Link to="/">Home</Link>
<Link to="../">Back</Link>
<Link to="edit">Edit</Link>
```

The `**NavLink**` component works exactly the same as the `Link` component, but it is specifically for showing active states on links, for example in nav bars.

By default if the `to` property of a `NavLink` is the same as the URL of the current page the link will have an `active` class added to it which you can use for styling. If this is not enough you can instead pass a function with an `isActive`parameter to the `className`, or `style` props, or as the children of the `NavLink`.

```jsx
<NavLink
  to="/"
  style={({ isActive }) => ({ color: isActive ? "red" : "black" })}
>
  Home
</NavLink>
```

A `NavLink` is considered active if the URL matches the `to` prop of the `NavLink` or if the current `Route` being rendered is inside a parent component that has a `path` that matches the `to` prop of the `NavLink`. If you do not want this default behavior you can set the `end` prop to `true` which will make it so the URL of the page must exactly match the `to` prop of the `NavLink`.

The `**Navigate**` component is a really simple component that when rendered will automatically redirect the user to the `to` prop of the `Navigate` component.

```jsx
<Navigate to="/" />
```

The `**useNavigation**` hook is a really simple hook that takes no parameters and returns a single `navigate` function which you can use to redirect a user to specific pages. This `navigate` function takes two parameters. The first parameter is the `to` location you want to redirect the user to and the second parameter is an object that can have keys for `replace`, and `state`.

```jsx
const navigate = useNavigate()

function onSubmit() {  
	// Submit form results  
	navigate("/books", { replace: true, state: { bookName: "Fake Title" } })}
```

The above code will redirect the user to the `/books` route. It will also replace the current route in history and pass along some state information as well.

Another way you can use the `navigate` function is to pass it a number. This will allow you to simulate hitting the forward/back button.

```jsx
navigate(-1) // Go back one page in history
navigate(-3) // Go back three pages in history
navigate(1) // Go forward one page in history
```

### Props

The `**replace**` prop is a boolean that when set to `true` will cause this link to replace the current page in the browser history.

```
/
/books
/books/3
```

If you click on a link that goes to the `/books/3/edit` page but it has the `replace`property set to `true` your new history will look like this.

```
/
/books
/books/3/edit
```

The page your were currently on was replaced with the new page. This means that if you click the back button on the new page it will bring you back to the `/books` page instead of the `/books/3` page.

The `**reloadDocument**` prop is another boolean and is very simple. If it is set to `true` your `Link` component will act like a normal anchor tag and do a full page refresh on navigation instead of just re-rendering the content inside your `Routes` component.

The final prop is called `**state**`. This prop lets you pass data along with your `Link` that does not show up anywhere in the URL. 

### Navigation Data

There are 3 main ways you can pass data between pages.

1. **Dynamic Parameters**
    
    We have already talked about how to use dynamic parameters in URLs by using the `useParams` hook. This is the best way to handle passing information like ids.
    
2. **Search Parameters**
    
    Search parameters are all of the parameters that come after the `?` in a URL (`?name=Kyle&age=27`). In order to work with search parameters you need to use the `useSearchParams` hook which works very similarly to the `useState` hook.
    
    The `useSearchParams` hook takes an initial value just like `useState`. This hook then returns two values. The first value is all our our search parameters and the second value is a function for updating our search parameters. You use `.get` with the fiurst value. The set function just takes a single argument that is the new value of your search parameters.
    
    ```jsx
    import { useSearchParams } from "react-router-dom"
    
    export function SearchExample() {
      const [searchParams, setSearchParams] = useSearchParams({ n: 3 })
      const number = searchParams.get("n")
    
      return (
        <>
          <h1>{number}</h1>
          <input
            type="number"
            value={number}
            onChange={e => setSearchParams({ n: e.target.value })}
          />
        </>
      )
    }
    ```
    
3. **State/Location Data**
    
    This information is all accessible via the `useLocation` hook. Using this hook is very simple as it returns one value and takes no parameters:
    
    ```jsx
    const location = useLocation()
    ```
    
    If we have the following URL `http://localhost/books?n=32#id` then the return value of `useLocation` would look like this:
    
    ```jsx
    {
      pathname: "/books",
      search: "?n=32",
      hash: "#id",
      key: "2JH3G3S",
      state: null
    }
    ```
    
    This location object contains all the information related to our URL. It also contains a unique key that you can use to do caching if you want to cache information for when a user clicks the back button to come back to a page.