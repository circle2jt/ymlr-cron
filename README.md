# ymlr-cron
Schedule jobs to do something base on cron pattern

## Features:
1. Schedule jobs
<br/>

# Tag details

| Tags | Description |
|---|---|
| [cron](#cron) | Schedule a task with cron pattern |
| [cron'del](#cron'del) | Stop a running cron job and delete it in cached |
| [cron'pause](#cron'pause) | Pause a running cron job |
| [cron'resume](#cron'resume) | Resume a pausing cron job |



## <a id="cron"></a>cron  
  
Schedule a task with cron pattern
` *     *     *      *       *        * `
(sec) (min) (hour) (date) (month) (dayOfWeek)

- `sec`           execution seconds (0-23)
- `min`           execution minutes (0-23)
- `hour`          execution hours (0-23)
- `date`          execution date of month (1-31)
- `month`         execution month (1-12)
- `dayOfWeek`     execution day of week (0-7) - 0 or 7 is Sunday, 1 is Monday ...  

Example:  

Print a message
```yaml
  - name: Schedule a job at 00:00:00 AM
    ymlr-cron:
      time: 0 0 0 * * *
      #times:                                   # Support multple times
      #  - 0 * * * * 1,2                        # Exec at each of minutes of MON, TUE
      #  - 0 0 * * * 3,4,5,6,0                  # Exec each of 00:00 of WED, THU, FRI, SAT, SUN
      scheduled: true
      runs:
        - name: Execute a job 1
      scheduled: false          # Start ASAP. Default true
      runOnInit:                # This will immediately fire your onTick function as soon as the requisite initialization has happened. This option is set to false by default for backwards compatibility.
      runs:
        - echo: Executed a job at ${ $parentState.cronData.execTime }  # $parentState.cronData.time: cron pattern (Date)
                                                              # $parentState.cronData.task: Task object
                                                              # $parentState.cronData.index: Task index (when use multiple times)
                                                              # $parentState.cronData.lastDate: Tells you the last execution date.
                                                              # $parentState.cronData.nextDate: Provides the next date that will trigger an onTick.

        - stop:                                               # Stop cron job, dont execute anymore
```  


## <a id="cron'del"></a>cron'del  
  
Stop a running cron job and delete it in cached
  

Example:  

```yaml
  - name: Schedule a job                       # Create a cron job "cron01" and shedule it
    ~ymlr-cron:
      name: cron01
      time: 0 * * * * *
      scheduled: true
      runs:
        - name: Execute a job 1

  - ~runs:
      - ymlr-cron'del: cron01                # Pause and remove it in cached. After this, the cron task will be finished to keep playing the next steps

  - name: cron job has been stoped !
```  


## <a id="cron'pause"></a>cron'pause  
  
Pause a running cron job
  

Example:  

```yaml
  - name: Schedule a job                       # Create a cron job "cron01" and shedule it
    ~ymlr-cron:
      name: cron01
      time: 0 * * * * *
      scheduled: true
      runs:
        - name: Execute a job 1

  - ~runs:
      - ymlr-cron'pause: cron01                # Pause it but keep it in cached to resume later
      - sleep: 10s
      - ymlr-cron'resume: cron01               # Resume it after 10s
```  


## <a id="cron'resume"></a>cron'resume  
  
Resume a pausing cron job
  

Example:  

```yaml
  - name: Schedule a job                       # Create a cron job "cron01" but not run yet
    ~ymlr-cron:
      name: cron01
      time: 0 * * * * *
      scheduled: false
      runs:
        - name: Execute a job 1

  - ~runs:
      - sleep: 5s                               # sleep 5s before start "cron01"
      - ymlr-cron'resume: cron01
```  


<br/>

### Have fun :)