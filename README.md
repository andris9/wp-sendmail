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

`SMTP="smtp://user:pass@host:587" MYSQL="mysql://user:pass@localhost/db" PREFIX="wp_" wp-sendmaild`

## License

**MIT**
