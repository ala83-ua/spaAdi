import { ref } from 'vue';

const listeners = {};

export function on(event, callback) {
  if (!listeners[event]) {
    listeners[event] = [];
  }
  listeners[event].push(callback);
}

export function off(event, callback) {
  if (listeners[event]) {
    listeners[event] = listeners[event].filter(cb => cb !== callback);
  }
}

export function emit(event, data) {
  if (listeners[event]) {
    listeners[event].forEach(callback => callback(data));
  }
}
