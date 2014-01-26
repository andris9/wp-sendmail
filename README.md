# wp-sendmail

Sendmail drop in replacement for WordPress.

By default a WordPress blog should be able to send e-mails **only** to registered users and to the admin and not to arbitrary e-mail addresses.

WordPress uses the default `mail` command for PHP which sends e-mails to the `sendmail` command. This projects emulates `sendmail` but checks all recipients before sending the message to a selected SMTP server. If a recipient can not be found from the users table, the message is not delivered.

This does not work in Windows.

## Usage

```
sudo npm install --unsafe-perm -g wp-sendmail
```

**Step 1**

Edit your php.ini and set `sendmail_path` to `/bin/env wp-sendmail`

**Step 2**

Run the checker server

`wp-sendmaild`

Config file resides in */etc/wp-sendmail.js* (this is why you need to run `npm install` as root)

Config file should be readable only to the user that is used for running the server or for root, if uid/gid values are used to downgrade the server.

Additionally you should block all outgoing traffic for port 25.

## License

**MIT**
