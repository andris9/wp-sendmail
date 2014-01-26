# wp-sendmail

Sendmail drop in replacement for WordPress.

WordPress uses the default `mail` command for PHP which sends e-mails to the `sendmail` command. This projects emulates `sendmail` but checks all recipients before sending the message to a selected SMTP server. If a recipient can not be found from the users table, the message is not delivered.

This does not work in Windows.

## Usage

```
npm install -g wp-sendmail
```

**Step 1**

Edit your php.ini and set `sendmail_path` to `/bin/env wp-sendmail`

**Step 2**

Run the checker server

`CONFIG=/path/to/config wp-sendmaild`

Check [config/example.js] for an example (this is also the default config file to be loaded).

If you do not specify config file, the following environment variables can be used:

  * **SMTP** target SMTP info (*"smtp://user:pass@host:port"*)
  * **MYSQL** WordPress database info (*"mysql://user:host@host/db"*)
  * **PREFIX** WordPress table prefix (*"wp_"*)
  * **DEBUG** if "true" then outputs SMTP data to console

Config file should be readable only to the user that is used for running the server or for root, if uid/gid values are used to downgrade the server.

Additionally you should block all outgoing traffic for port 25.

## License

**MIT**
