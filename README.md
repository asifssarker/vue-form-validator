# vue-validator

> Note: this project is still under development. Please DO NOT use it in production environment.

Deadly simple form validation for Vue.js. Features:

- Built in data types, including email, number, domain, url, etc.
- Customizable validation rules.
- Native support for async validation.

## Usage

To use `vue-validator`, you need to `install` it to `Vue`.

```javascript
import Vue from 'vue';
import VueValidator from 'vue-validator';
Vue.install(VueValidator);
```

Then you can use `v-validator` directive on `form` element:

```html
<div id="app">
    <form class="form" v-validator="loginForm">
        <div class="field">
            <label>Username:</label>
            <input type="text" v-model="userName" required minlength="3">
        </div>
        <div class="field">
            <label>Password:</label>
            <input type="password" v-model="password" minlength="6">
        </div>
    </form>
</div>
```

```javascript
var vm = new Vue({
    el: '#app',
    data: {
        userName: '',
        password: ''
    }
});
```

The value for `v-validator` attribute is required. You can use it to check the validability of the form. For the code above, `vm.loginForm.$valid` means whether the form is valid.

### Validation rules

Validation rules are attributes added to `input`/`select`/`textarea` elements. For example, `<input type="text" v-model="userName" required>` means the `input` is required to fill.

#### required

The `required` rule indicates the form control must be filled or checked. Add `required` attribute to the form control without attribute value.

```html
<input type="text" v-model="title" required>
```

#### minlength

The `minlength="x"` rule means the form control must be filled with at least `x` characters.

```html
<input type="text" v-model="name" minlength="3">
```

