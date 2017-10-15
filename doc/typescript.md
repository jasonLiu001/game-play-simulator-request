TypeScript
============

## 基于`string`类型的枚举继承实现
```typescript
enum E {}

enum BasicEvents {
  Start = 'Start',
  Finish = 'Finish'
}
enum AdvEvents {
  Pause = 'Pause',
  Resume = 'Resume'
}
function enumerate<T1 extends typeof E, T2 extends typeof E>(e1: T1, e2: T2) {
  enum Events {
    Restart = 'Restart'
  }
  return Events as typeof Events & T1 & T2;
}

const e = enumerate(BasicEvents, AdvEvents);
```