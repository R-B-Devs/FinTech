       IDENTIFICATION DIVISION.
       PROGRAM-ID. CREDITCHECK.

       ENVIRONMENT DIVISION.
       INPUT-OUTPUT SECTION.
       FILE-CONTROL.
           SELECT TRANSACTION-FILE ASSIGN TO 'transactions.csv'
               ORGANIZATION IS LINE SEQUENTIAL.
           SELECT OUTPUT-FILE ASSIGN TO 'credit_score_output.csv'
               ORGANIZATION IS LINE SEQUENTIAL.

       DATA DIVISION.
       FILE SECTION.
       FD TRANSACTION-FILE.
       01 TRANSACTION-LINE         PIC X(200).

       FD OUTPUT-FILE.
       01 OUTPUT-LINE              PIC X(200).

       WORKING-STORAGE SECTION.
       01 HEADER-FLAG              PIC X VALUE 'Y'.
       01 WS-END-FILE              PIC X VALUE 'N'.

       01 WS-TRANSACTION-FIELDS.
          05 F-CUSTOMER-ID         PIC X(10).
          05 F-TYPE                PIC X(6).
          05 F-AMOUNT              PIC 9(7)V99.
          05 F-DATE                PIC X(10).
          05 F-ACCOUNT-AGE         PIC 9(3).
          05 F-MISSED-PAYMENTS     PIC 9(3).

       01 WS-AGGREGATES.
          05 WS-TOTAL-CREDIT       PIC 9(7)V99 VALUE 0.
          05 WS-TOTAL-DEBIT        PIC 9(7)V99 VALUE 0.
          05 WS-SCORE              PIC 9(3)     VALUE 0.
          05 WS-CREDIT-STATUS      PIC X(10)    VALUE SPACES.

       PROCEDURE DIVISION.
       MAIN-LOGIC.
           OPEN INPUT TRANSACTION-FILE
           OPEN OUTPUT OUTPUT-FILE

           PERFORM UNTIL WS-END-FILE = 'Y'
               READ TRANSACTION-FILE
                   AT END
                       MOVE 'Y' TO WS-END-FILE
                   NOT AT END
                       IF HEADER-FLAG = 'Y'
                           MOVE 'N' TO HEADER-FLAG
                       ELSE
                           PERFORM PARSE-AND-PROCESS
                       END-IF
               END-READ
           END-PERFORM

           CLOSE TRANSACTION-FILE
           CLOSE OUTPUT-FILE
           STOP RUN.

       PARSE-AND-PROCESS.
           UNSTRING TRANSACTION-LINE
               DELIMITED BY ","
               INTO F-CUSTOMER-ID
                    F-TYPE
                    F-AMOUNT
                    F-DATE
                    F-ACCOUNT-AGE
                    F-MISSED-PAYMENTS

           IF F-TYPE = 'credit'
               ADD F-AMOUNT TO WS-TOTAL-CREDIT
           ELSE IF F-TYPE = 'debit'
               ADD F-AMOUNT TO WS-TOTAL-DEBIT
           END-IF

           PERFORM CALCULATE-SCORE
           PERFORM WRITE-RESULTS.

       CALCULATE-SCORE.
           COMPUTE WS-SCORE = (WS-TOTAL-CREDIT / 100) -
                              (WS-TOTAL-DEBIT / 100) -
                              (F-MISSED-PAYMENTS * 5) +
                              (F-ACCOUNT-AGE)

           IF WS-SCORE < 50
               MOVE "Poor" TO WS-CREDIT-STATUS
           ELSE IF WS-SCORE < 75
               MOVE "Fair" TO WS-CREDIT-STATUS
           ELSE IF WS-SCORE < 90
               MOVE "Good" TO WS-CREDIT-STATUS
           ELSE
               MOVE "Excellent" TO WS-CREDIT-STATUS
           END-IF.

       WRITE-RESULTS.
           STRING
               F-CUSTOMER-ID DELIMITED BY SIZE ","
               WS-SCORE DELIMITED BY SIZE ","
               WS-TOTAL-DEBIT DELIMITED BY SIZE ","
               WS-TOTAL-CREDIT DELIMITED BY SIZE ","
               F-MISSED-PAYMENTS DELIMITED BY SIZE ","
               F-ACCOUNT-AGE DELIMITED BY SIZE ","
               WS-CREDIT-STATUS DELIMITED BY SIZE
               INTO OUTPUT-LINE

           WRITE OUTPUT-LINE

           MOVE 0 TO WS-TOTAL-DEBIT
           MOVE 0 TO WS-TOTAL-CREDIT.
